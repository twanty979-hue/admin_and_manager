import Link from "next/link"
import { getProducts } from "../../../actions/woodslab" 
import { Plus, Search, Edit, Package } from "lucide-react"

export default async function InventoryPage() {
  const { data: products, error } = await getProducts()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
  }

  // ❌ 1. ลบฟังก์ชัน getImageUrl ออกไปเลยครับ ไม่ใช้แล้ว
  /* const getImageUrl = (path: string) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/...`
  } 
  */

  if (error) {
    return <div className="p-8 text-red-500">Error loading products: {error}</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header (เหมือนเดิม) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-600" />
              คลังสินค้า (Inventory)
            </h1>
          </div>
          
          <Link 
            href="/inventory/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-medium"
          >
            <Plus className="w-5 h-5" /> เพิ่มสินค้าใหม่
          </Link>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4 w-[100px]">รูปภาพ</th>
                  <th className="p-4">ชื่อสินค้า / SKU</th>
                  <th className="p-4">ราคา</th>
                  <th className="p-4 text-center">สถานะ</th>
                  <th className="p-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      ไม่พบรายการสินค้า
                    </td>
                  </tr>
                ) : (
                  products?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden relative">
                          {item.image_url ? (
                            // ✅ 2. แก้ตรงนี้: ใช้ item.image_url ตรงๆ เลย (ไม่ต้องครอบ getImageUrl)
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-800 text-sm mb-1">{item.name}</div>
                        <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                            SKU: {item.sku}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-blue-600 text-sm">{formatCurrency(item.price)}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}
                        `}>
                          {item.status || 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/inventory/${item.id}`} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-sm"
                        >
                          <Edit className="w-4 h-4" /> แก้ไข
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}