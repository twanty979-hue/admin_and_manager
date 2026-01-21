"use client";

import { useState, useEffect } from "react";
import { getAllInventory, type AdminStockData } from "../../../actions/stock-admin";
import { Package, Search, MapPin, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

export default function AdminStockPage() {
  const [stock, setStock] = useState<AdminStockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

// ... (ส่วนบนคงเดิม)
const loadStock = async (q: string = "") => {
  setLoading(true);
  const res = await getAllInventory(q);
  if (res.error) {
    console.error(res.error);
  } else if (res.data) {
    setStock(res.data);
    // ✅ อัปเดต TotalCount ถ้าคุณมีการใช้ State นี้
    // setTotalCount(res.totalCount); 
  }
  setLoading(false);
};
// ...

  useEffect(() => { loadStock(); }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Package className="text-blue-600 w-8 h-8" /> คลังสินค้าทุกสาขา
          </h1>
          <p className="text-slate-500 font-medium">ภาพรวมสต็อกคงเหลือแยกตามสาขาและรายการสินค้า</p>
        </div>
        <button 
          onClick={() => loadStock(search)}
          className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:text-blue-600 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text"
          placeholder="ค้นหาชื่อสินค้า หรือ SKU..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadStock(search)}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">สาขา</th>
                <th className="px-6 py-5">สินค้า / SKU</th>
                <th className="px-6 py-5 text-right">จำนวนคงเหลือ</th>
                <th className="px-6 py-5">หน่วย</th>
                <th className="px-6 py-5 text-right">อัปเดตล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
              ) : stock.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">ไม่พบข้อมูลสินค้าในสต็อก</td></tr>
              ) : (
                stock.map((item) => {
                  const isLow = Number(item.qty) <= 5;
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">{item.branches?.branch_name}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{item.branches?.branch_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{item.products?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {item.products?.sku || '-'}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className={`text-lg font-black flex items-center justify-end gap-1.5 ${isOut(item.qty) ? 'text-rose-600' : 'text-slate-800'}`}>
                          {isLow && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {Number(item.qty).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          {item.products?.unit || 'PCS'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-xs font-bold text-slate-500">
                          {new Date(item.updated_at).toLocaleDateString('th-TH')}
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium">
                          {new Date(item.updated_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function isOut(qty: number) { return Number(qty) <= 0; }