"use client"

import { useState, useEffect } from "react"
// ❌ ไม่มีการ import createBrowserClient แล้ว
import { 
  CalendarCheck, RefreshCcw, CheckCircle2, 
  AlertCircle, Wallet, Banknote, CalendarDays, Loader2 
} from "lucide-react"

// ✅ เรียกใช้ Server Action ครบชุด (รวม getUserProfile)
import { getPendingDays, closeDayAction, getUserProfile } from "../../../../actions/close_day"

// --- Types ---
interface DaySummary {
  dayKey: string
  bills: number
  total: number
  cash_total: number
  promptpay_total: number
}

interface Profile {
  branch_id: number
  branch_name: string
  full_name: string
}

// --- Helper Functions ---
const fmtMoney = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const ddmmyyyy = (dayKey: string) => { const [y, m, d] = dayKey.split("-"); return `${d}/${m}/${y}` }

export default function CloseDayPage() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [pendingDays, setPendingDays] = useState<DaySummary[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ❌ ลบส่วนที่เรียก process.env... ทิ้งไปเลยครับ 
  // เพราะเราจะใช้ getUserProfile() จาก Server Action แทน

  // --- 1. Init: Load Profile (ผ่าน Server Action) ---
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // ✅ ใช้ Server Action แทนการยิง Supabase เองที่หน้าบ้าน
        const res = await getUserProfile()
        
        if (res.error || !res.profile) {
           console.error("Auth Error:", res.error)
           return
        }

        setCurrentUser(res.user)
        setProfile(res.profile)
        
        // โหลดข้อมูลต่อทันทีด้วย ID ที่ได้จาก Server
        await loadPendingSales(res.profile.branch_id)

      } catch (err) {
        console.error("Init Error:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // --- 2. Load Function (Server Action) ---
  const loadPendingSales = async (branchId: number) => {
      const { data, error } = await getPendingDays(branchId)
      if (error) {
          alert("โหลดข้อมูลไม่สำเร็จ: " + error)
      } else {
          setPendingDays(data as DaySummary[])
      }
  }

  // --- 3. Close Logic (Server Action) ---
  const handleCloseDay = async (daySummary: DaySummary) => {
    if (!profile) return
    const { dayKey } = daySummary
    
    if (!confirm(`ยืนยันปิดวัน ${ddmmyyyy(dayKey)} ?`)) return

    setProcessing(true)
    
    // ✅ เรียกใช้ Server Action
    const res = await closeDayAction(profile.branch_id, dayKey)

    if (res.error) {
        alert("❌ ผิดพลาด: " + res.error)
    } else {
        alert(`✅ ปิดยอดวัน ${ddmmyyyy(dayKey)} สำเร็จ!\nยอดรวม: ฿${fmtMoney(res.total)}`)
        await loadPendingSales(profile.branch_id)
    }
    
    setProcessing(false)
  }

  const handleCloseAll = async () => {
    if (pendingDays.length === 0) return
    if (!confirm(`ยืนยันปิดยอดค้างทั้งหมด ${pendingDays.length} วัน?`)) return
    
    setProcessing(true)
    for (const d of pendingDays) { 
        await closeDayAction(profile!.branch_id, d.dayKey) 
    }
    await loadPendingSales(profile!.branch_id)
    setProcessing(false)
    alert("✅ ปิดยอดทั้งหมดเรียบร้อย")
  }

  const totalPendingAmount = pendingDays.reduce((sum, d) => sum + d.total, 0)
  const totalPendingBills = pendingDays.reduce((sum, d) => sum + d.bills, 0)

  if (loading) return (
    <div className="flex flex-col h-[60vh] items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500"/> 
      <p>กำลังโหลดข้อมูล...</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-blue-600" />
            ปิดรอบรายวัน (Hidden Backend)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            สาขา: <span className="font-bold text-slate-700">{profile?.branch_name}</span> | 
            ผู้ทำรายการ: {profile?.full_name}
          </p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => profile && loadPendingSales(profile.branch_id)}
             disabled={processing}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-blue-600 font-bold transition-all disabled:opacity-50"
           >
             <RefreshCcw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} /> 
             รีเฟรช
           </button>
           
           {pendingDays.length > 0 && (
             <button 
               onClick={handleCloseAll}
               disabled={processing}
               className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-bold shadow-lg shadow-slate-200 transition-all disabled:opacity-50"
             >
               <CheckCircle2 className="w-4 h-4" /> 
               ปิดยอดทั้งหมด ({pendingDays.length})
             </button>
           )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center h-32">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><AlertCircle className="w-4 h-4"/></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">วันค้างปิดรอบ</span>
           </div>
           <div className="text-3xl font-black text-slate-800">{pendingDays.length} <span className="text-lg font-medium text-slate-400">วัน</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center h-32">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Banknote className="w-4 h-4"/></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ยอดเงินรอปิดงบ</span>
           </div>
           <div className="text-3xl font-black text-blue-600">฿{fmtMoney(totalPendingAmount)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center h-32">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet className="w-4 h-4"/></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">จำนวนบิลรวม</span>
           </div>
           <div className="text-3xl font-black text-emerald-700">{totalPendingBills.toLocaleString()} <span className="text-lg font-medium text-slate-400">บิล</span></div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
           <h2 className="font-bold text-slate-800 flex items-center gap-2">
             <CalendarDays className="w-5 h-5 text-blue-600"/> รายการรอปิดยอด (เฉพาะสาขานี้)
           </h2>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">วันที่</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">จำนวนบิล</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">เงินสด</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">โอน/QR</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">ยอดรวม</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingDays.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                       <CheckCircle2 className="w-12 h-12 text-slate-200" />
                       <p className="font-medium text-slate-400">ไม่มีรายการค้างปิดรอบ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingDays.map((d) => (
                  <tr key={d.dayKey} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm font-bold text-slate-700 font-mono">{ddmmyyyy(d.dayKey)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-right font-mono">{d.bills}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono text-right">{fmtMoney(d.cash_total)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono text-right">{fmtMoney(d.promptpay_total)}</td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-sm font-bold text-slate-900 font-mono">฿{fmtMoney(d.total)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button 
                         onClick={() => handleCloseDay(d)}
                         disabled={processing}
                         className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm disabled:opacity-50"
                       >
                         ปิดรอบ
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  )
}