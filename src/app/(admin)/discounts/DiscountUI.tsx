"use client"

import { useState } from "react"
// ตรวจสอบชื่อไฟล์ action ให้ตรง (ถ้ามี s หรือไม่มี s)
import { createDiscount, toggleDiscountStatus, deleteDiscount } from "../../../actions/discoun" 
import { Loader2, Plus, Trash2, Tag, Calendar } from "lucide-react"

// ✅ ต้องมี export default ตรงนี้เพื่อให้ page.tsx เรียกใช้งานได้
export default function DiscountClient({ 
  discounts, 
  products, 
  branches 
}: { 
  discounts: any[], 
  products: any[], 
  branches: any[] 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await createDiscount(formData)
    setLoading(false)

    if (res?.error) {
      alert("Error: " + res.error)
    } else {
      setIsModalOpen(false)
    }
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* --- ส่วน Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Tag className="w-6 h-6 text-indigo-600" /> จัดการส่วนลด (Discounts)
          </h1>
          <p className="text-slate-500 text-sm mt-1">สร้างและจัดการโปรโมชั่น คูปองส่วนลด</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-sm font-bold"
        >
          <Plus className="w-4 h-4" /> สร้างส่วนลดใหม่
        </button>
      </div>

      {/* --- ตารางรายการ (ยกตัวอย่างส่วนสำคัญ) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ชื่อโปรโมชั่น</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">มูลค่า</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">สถานะ</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {discounts.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 font-bold text-sm">{item.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                    {item.value}{item.discount_type === 'PERCENT' ? '%' : ' ฿'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                   <button 
                      onClick={() => toggleDiscountStatus(item.id, item.active)}
                      className={`h-6 w-11 rounded-full transition-colors ${item.active ? 'bg-green-500' : 'bg-slate-300'}`}
                   >
                      <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${item.active ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteDiscount(item.id)} className="text-slate-400 hover:text-red-600 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Modal ฟอร์ม (ใส่เฉพาะจุดสำคัญ) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden p-6 animate-in zoom-in duration-200">
              <h3 className="text-slate-800 font-bold text-lg mb-4">สร้างส่วนลดใหม่</h3>
              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ชื่อโปรโมชั่น</label>
                  <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ประเภท</label>
                    <select name="discount_type" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none">
                      <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                      <option value="FIXED">จำนวนเงิน (บาท)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">มูลค่า</label>
                    <input name="value" type="number" step="0.01" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                  </div>
                </div>
                {/* --- ส่วน Rules --- */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-800 mb-2">เงื่อนไข (Rules)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <select name="product_id" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                      <option value="">ทุกสินค้า</option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select name="branch_id" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                      <option value="">ทุกสาขา</option>
                      {branches.map((b: any) => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-500 font-bold px-4">ยกเลิก</button>
                  <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50">
                    {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}