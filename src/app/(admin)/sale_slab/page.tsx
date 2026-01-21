"use client"

import { useState, useEffect, useCallback } from 'react'
import { getInventoryList, updateProductStatus, getAllProductsForExport } from '../../../actions/saleslab'
import { 
  Search, Download, Moon, Sun, ChevronLeft, ChevronRight, 
  Loader2, CheckCircle, XCircle, Clock, AlertCircle 
} from 'lucide-react'

// --- TYPES ---
interface Product {
  id: number
  name: string
  sku: string
  price: number
  image_url: string | null
  status: string
  specs: any
  width_cm?: number
  length_cm?: number
  thickness_cm?: number
  barcode?: string
}

const STATUS_TABS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "request", label: "รออนุมัติ" },
  { key: "pending", label: "จองแล้ว" },
  { key: "sold", label: "ขายแล้ว" },
]

export default function InventoryPage() {
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // Filter State
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDark, setIsDark] = useState(false)

  // Toast State
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null)

  const LIMIT = 12

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data, count, error } = await getInventoryList(page, LIMIT, search, statusFilter)
    if (error) {
      showToast("โหลดข้อมูลล้มเหลว", 'error')
    } else {
      setProducts(data as Product[] || [])
      setTotal(count || 0)
    }
    setLoading(false)
  }, [page, search, statusFilter])

  // Effect: Fetch data when dependencies change
  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchData()
    }, 400)
    return () => clearTimeout(timer)
  }, [fetchData])

  // --- HANDLERS ---
  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    // Optimistic Update
    const oldProducts = [...products]
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))

    const res = await updateProductStatus(id, newStatus)
    
    if (res.error) {
        showToast("เกิดข้อผิดพลาดในการอัปเดต", 'error')
        setProducts(oldProducts) // Revert
    } else {
        showToast("อัปเดตสถานะเรียบร้อย", 'success')
        fetchData() // Refresh
    }
  }

  const handleExportCSV = async () => {
    const filenameFilter = statusFilter === 'all' ? 'All' : statusFilter
    showToast(`กำลังสร้างไฟล์ CSV (${filenameFilter})...`, 'success')
    
    const { data, error } = await getAllProductsForExport(statusFilter)
    
    if (error || !data) {
        showToast("ดึงข้อมูล Export ล้มเหลว", 'error')
        return
    }

    // 1. Headers คงเดิม
    const headers = [
        "Product Name", "SKU", "Type", "Grade", "Finish", "Origin", "Material", 
        "Width Cm", "Length Cm", "Thickness Cm", "Brightness", "Color Craft", 
        "Edge Design", "Panel Craft", "Images Count", "Panel Design", "Texture Craft", 
        "Status", "Price", "Barcode", "Image URL"
    ]

    // 2. Map ข้อมูล (ลอจิกเดิม แต่ตัด process.env ออก เพราะ server ส่ง url เต็มมาแล้ว)
    const csvRows = data.map((item: any) => {
        const specs = item.specs || {}
        
        // ✅ ใช้ item.image_url ได้เลย เพราะ Server Action (getAllProductsForExport) สร้าง Full URL มาให้แล้ว
        const fullImageUrl = item.image_url || ""

        return [
            `"${(item.name || "").replace(/"/g, '""')}"`,
            `"${(item.sku || "")}"`,
            `"${(specs.type || "")}"`,
            `"${(specs.grade || "")}"`,
            `"${(specs.finish || "")}"`,
            `"${(specs.origin || "")}"`,
            `"${(specs.material || "")}"`,
            item.width_cm || specs.width_cm || 0,
            item.length_cm || specs.length_cm || 0,
            item.thickness_cm || specs.thickness_cm || 0,
            `"${(specs.brightness || "")}"`,
            `"${(specs.color_craft || "")}"`,
            `"${(specs.edge_design || "")}"`,
            `"${(specs.panel_craft || "")}"`,
            specs.images_count || 0,
            `"${(specs.panel_design || "")}"`,
            `"${(specs.texture_craft || "")}"`,
            `"${(item.status || "available").toUpperCase()}"`,
            item.price || 0,
            `"${(item.barcode || "")}"`,
            `"${fullImageUrl}"` // Image URL
        ].join(",")
    })

    // 3. รวม Header + Content และสั่ง Download
    const content = [headers.join(","), ...csvRows].join("\n")
    const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    
    a.download = `inventory_${filenameFilter}_${new Date().toISOString().split('T')[0]}.csv`
    
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- HELPER RENDERS ---
  const getEffectiveStatus = (status: string) => {
    const st = (status || "").toLowerCase()
    if (st === "on_request") return "request"
    if (["pending", "reserved", "hold"].includes(st)) return "pending"
    if (["sold", "archived", "inactive"].includes(st)) return "sold"
    return "available"
  }

  const currency = (n: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(n)

  // Toggle Dark Mode
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDark])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans`}>
      
      {/* --- HEADER --- */}
      <header className={`sticky top-0 z-30 px-8 py-4 flex items-center justify-between backdrop-blur-md border-b transition-colors
        ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-blue-100'}`}>
        
        <div className="flex items-center gap-10">
           <div className="ml-0 lg:ml-[20px]">
              <h1 className="text-xl font-black text-blue-600 tracking-tight">WOODSLABS</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Inventory Hub</p>
           </div>
           
           {/* TABS */}
           <nav className={`flex gap-1 p-1.5 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100/50'}`}>
              {STATUS_TABS.map(tab => (
                 <button 
                    key={tab.key}
                    onClick={() => { setStatusFilter(tab.key); setPage(0); }}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all
                        ${statusFilter === tab.key 
                           ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                           : 'text-slate-500 hover:bg-white/50 hover:text-blue-600'
                        }`}
                 >
                    {tab.label}
                 </button>
              ))}
           </nav>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                 value={search}
                 onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                 placeholder="ค้นหา SKU หรือ ชื่อสินค้า..." 
                 className={`pl-10 pr-4 py-2 rounded-xl text-xs font-medium w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all
                    ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border border-slate-200 text-slate-900'}`}
              />
           </div>
           
           <button onClick={handleExportCSV} className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm">
              <Download className="w-4 h-4" /> EXPORT CSV
           </button>
           
           <button onClick={() => setIsDark(!isDark)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100'}`}>
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
           </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-[1600px] mx-auto py-10 px-8">
         
         {/* STATUS BAR */}
         <div className={`mb-8 flex justify-between items-center p-6 rounded-2xl shadow-sm border
            ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            
            <div className="flex items-center gap-3">
               <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
               <div>
                  <h2 className="text-sm font-bold tracking-wide uppercase">
                     {loading ? 'กำลังโหลดข้อมูล...' : `จำนวนทั้งหมด: ${total} รายการ`}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">REAL-TIME INVENTORY TRACKING</p>
               </div>
            </div>

            <div className={`flex items-center gap-4 p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
               <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30 disabled:hover:shadow-none">
                  <ChevronLeft className="w-5 h-5" />
               </button>
               <div className="text-sm font-black text-blue-600 w-8 text-center">{String(page + 1).padStart(2, '0')}</div>
               <button onClick={() => setPage(p => p + 1)} disabled={products.length < LIMIT} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30 disabled:hover:shadow-none">
                  <ChevronRight className="w-5 h-5" />
               </button>
            </div>
         </div>

         {/* GRID DISPLAY */}
         {loading && products.length === 0 ? (
            <div className="flex justify-center items-center py-40">
               <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
         ) : products.length === 0 ? (
            <div className="text-center py-40 opacity-60">
               <div className="text-xl font-bold uppercase tracking-widest mb-2">ไม่พบรายการสินค้า</div>
               <p className="text-sm">ลองค้นหาใหม่อีกครั้ง</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
               {products.map(product => {
                  const status = getEffectiveStatus(product.status)
                  // ✅ ใช้ product.image_url ได้เลย ไม่ต้องต่อ string เองแล้ว
                  const imgUrl = product.image_url 

                  return (
                     <div key={product.id} className={`group relative rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border
                        ${isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-slate-100 hover:border-blue-500'}`}>
                        
                        {/* IMAGE */}
                        <div className="aspect-square relative bg-slate-100 overflow-hidden">
                           {imgUrl ? (
                              <img src={imgUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                           ) : (
                              <div className="flex items-center justify-center h-full text-slate-300 text-xs font-bold">ไม่มีรูปภาพ</div>
                           )}
                           
                           {/* Status Badge Overlay */}
                           {status !== 'available' && (
                              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                 <div className={`px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-lg
                                    ${status === 'request' ? 'bg-indigo-500' : 
                                      status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}>
                                    {status === 'request' ? 'รออนุมัติ' : status === 'pending' ? 'จองแล้ว' : 'ขายแล้ว'}
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* INFO */}
                        <div className="p-5">
                           <h3 className="font-bold text-sm mb-1 truncate">{product.name || 'ไม่มีชื่อสินค้า'}</h3>
                           <span className="text-xs font-mono font-semibold text-slate-400">{product.sku}</span>
                           <div className="mt-3 text-lg font-extrabold text-blue-600">{currency(product.price)}</div>
                        </div>

                        {/* ACTION BAR */}
                        <div className={`p-4 border-t flex flex-col gap-2 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-blue-50/30 border-blue-50'}`}>
                           {status === 'available' ? (
                              <>
                                 <button onClick={() => handleStatusUpdate(product.id, 'pending')} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1">
                                    <Clock className="w-3 h-3" /> จองสินค้า
                                 </button>
                                 <button onClick={() => handleStatusUpdate(product.id, 'sold')} className="w-full py-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 text-xs font-bold transition">
                                    ขายแล้ว
                                 </button>
                              </>
                           ) : status === 'request' ? (
                              <>
                                 <button onClick={() => handleStatusUpdate(product.id, 'pending')} className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center justify-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> อนุมัติจอง
                                 </button>
                                 <button onClick={() => handleStatusUpdate(product.id, 'available')} className="w-full py-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 text-xs font-bold transition">
                                    ปฏิเสธ
                                 </button>
                              </>
                           ) : (
                              <div className="space-y-2">
                                 <button onClick={() => handleStatusUpdate(product.id, 'available')} className="w-full py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-bold transition">
                                    ปรับเป็นว่าง
                                 </button>
                                 {status === 'pending' && (
                                    <button onClick={() => handleStatusUpdate(product.id, 'sold')} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition">
                                       ยืนยันขาย
                                    </button>
                                 )}
                              </div>
                           )}
                        </div>
                     </div>
                  )
               })}
            </div>
         )}
      </main>

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl z-50 text-white font-bold flex items-center gap-3 animate-bounce
            ${toast.type === 'success' ? 'bg-slate-800' : 'bg-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5" />}
            {toast.msg}
        </div>
      )}

    </div>
  )
}