"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createBranch, deleteBranch } from "../../../actions/branches"

// Interface สำหรับข้อมูล
interface Branch {
  id: number
  branch_code: string
  branch_name: string
  created_at: string
}

export default function BranchClient({ initialBranches }: { initialBranches: Branch[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok'|'err'|'warn', title: string, msg: string } | null>(null)

  // ฟังก์ชันแสดง Toast (เลียนแบบของเดิม)
  const showToast = (type: 'ok'|'err'|'warn', title: string, msg: string) => {
    setToast({ type, title, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await createBranch(formData)
    setLoading(false)

    if (res.error) {
      showToast('err', 'บันทึกไม่สำเร็จ', res.error)
    } else {
      showToast('ok', 'บันทึกสำเร็จ', res.message || "")
      formRef.current?.reset() // ล้างฟอร์ม
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบสาขานี้?")) return
    
    const res = await deleteBranch(id)
    if (res.error) {
      showToast('err', 'ลบไม่สำเร็จ', res.error)
    } else {
      showToast('ok', 'ลบสำเร็จ', 'ลบข้อมูลเรียบร้อย')
    }
  }

  // Format Date
  const dtFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" })

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">เพิ่มสาขา (Branches)</div>
            <div className="text-sm text-slate-500">จัดการข้อมูลสาขาทั้งหมด</div>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            System Online
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[min(520px,92vw)] animate-in fade-in slide-in-from-top-2">
          <div className="rounded-2xl border bg-white shadow-lg p-3">
            <div className="flex items-start gap-3">
              <div className={`mt-1 h-2.5 w-2.5 rounded-full ${
                toast.type === 'ok' ? 'bg-emerald-600' : toast.type === 'warn' ? 'bg-amber-500' : 'bg-rose-600'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">{toast.title}</div>
                <div className="text-sm text-slate-600 mt-0.5">{toast.msg}</div>
              </div>
              <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-800 text-sm">ปิด</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Form Section */}
          <section className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-slate-200">
                <div className="text-base font-semibold text-slate-900">ข้อมูลสาขา</div>
                <div className="text-sm text-slate-500 mt-1">กรอกให้ครบ แล้วกดบันทึก</div>
              </div>

              <form ref={formRef} action={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">รหัสสาขา</label>
                  <input 
                    name="branch_code" 
                    type="text" 
                    placeholder="เช่น BKK01"
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 transition"
                    autoComplete="off" 
                  />
                  <div className="text-xs text-slate-500 mt-1">ห้ามซ้ำ และไม่เว้นวรรค</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">ชื่อสาขา</label>
                  <input 
                    name="branch_name" 
                    type="text" 
                    placeholder="เช่น สาขาสยาม"
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 transition"
                    autoComplete="off" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-slate-200"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกสาขา'}
                </button>

                <button 
                  type="button"
                  onClick={() => formRef.current?.reset()}
                  className="w-full rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 font-medium text-slate-600 transition"
                >
                  ล้างฟอร์ม
                </button>
              </form>
            </div>
          </section>

          {/* List Section */}
          <section className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[400px]">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <div className="text-base font-semibold text-slate-900">รายการสาขา</div>
                  <div className="text-sm text-slate-500">ทั้งหมด <span className="font-bold text-slate-900">{initialBranches.length}</span> รายการ</div>
                </div>
                <button 
                  onClick={() => router.refresh()}
                  className="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition"
                >
                  ↻ รีโหลด
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3 w-[25%]">รหัสสาขา</th>
                      <th className="px-5 py-3">ชื่อสาขา</th>
                      <th className="px-5 py-3 w-[25%]">สร้างเมื่อ</th>
                      <th className="px-5 py-3 w-[10%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {initialBranches.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-20 text-center text-sm text-slate-400">
                          ยังไม่มีข้อมูลสาขาในระบบ
                        </td>
                      </tr>
                    ) : (
                      initialBranches.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition group">
                          <td className="px-5 py-4 text-sm font-bold text-slate-800 font-mono bg-slate-50/30">
                            {r.branch_code}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-700 font-medium">
                            {r.branch_name}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-400">
                            {r.created_at ? dtFmt.format(new Date(r.created_at)) : "-"}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button 
                              onClick={() => handleDelete(r.id)}
                              className="rounded-xl border border-transparent hover:border-rose-200 bg-transparent hover:bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}