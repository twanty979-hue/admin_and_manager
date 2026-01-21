"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  History, Search, RotateCw, ChevronLeft, ChevronRight, 
  Loader2, ArrowUpRight, ArrowDownLeft, MapPin, BadgeInfo, AlertCircle
} from "lucide-react";
import { getDetailedStockMovements, getMyProfile, type StockMovement } from "../../../actions/stockmovement";

export default function StockMovementPage() {
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  const pageSize = 30;
  const pageAll = Math.max(1, Math.ceil(totalCount / pageSize));

  const loadData = useCallback(async (branchId?: number, currentPage: number = 1, query: string = "") => {
    setFetching(true);
    setErrorMsg(null);
    const res = await getDetailedStockMovements(branchId, currentPage, query);
    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.data) {
      setMovements(res.data);
      setTotalCount(res.totalCount);
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    getMyProfile().then(res => {
      if (res.data) {
        setProfile(res.data);
        loadData(undefined, 1, ""); 
      }
      setLoading(false);
    });
  }, [loadData]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 pb-20 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <History className="text-blue-600 w-8 h-8" /> 
            ประวัติการเคลื่อนไหวสต็อก
          </h1>
          <p className="text-sm text-slate-500 font-medium">มุมมองผู้ดูแลระบบ (ทุกสาขา)</p>
        </div>
        <button 
          onClick={() => loadData(undefined, 1, searchQuery)} 
          className="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm hover:text-blue-600 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
        >
          <RotateCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} /> รีเฟรช
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-bold">Error: {errorMsg}</div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-[1.5rem] text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
            placeholder="ค้นหาชื่อสินค้า หรือ SKU..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && loadData(undefined, 1, searchQuery)} 
          />
        </div>
        <button 
          onClick={() => loadData(undefined, 1, searchQuery)} 
          className="px-8 py-3 bg-slate-900 text-white rounded-[1.5rem] text-sm font-bold hover:bg-blue-600 transition-all"
        >
          ค้นหา
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-[0.15em]">
              <tr>
                <th className="px-6 py-5">วัน-เวลา / สาขา</th>
                <th className="px-6 py-5">รายการสินค้า</th>
                <th className="px-6 py-5">ประเภท</th>
                <th className="px-6 py-5 text-right">จำนวน</th>
                <th className="px-6 py-5">ผู้ทำรายการ</th>
                <th className="px-6 py-5">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fetching && movements.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-slate-300" /></td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic font-medium">ไม่พบประวัติรายการเคลื่อนไหว</td></tr>
              ) : (
                movements.map((m) => {
                  const isOut = m.type?.toLowerCase() === 'out';
                  return (
                    <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5 text-xs font-bold text-slate-800">
                        {new Date(m.created_at_ts).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        <div className="text-[10px] text-blue-500 mt-1 uppercase font-black tracking-tighter">
                          {m.branches?.branch_name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-sm">{m.products?.name || "Unknown"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {m.products?.sku || "-"}</div>
                      </td>
                      <td className="px-6 py-5">
                        {isOut ? (
                          <span className="text-rose-600 font-black text-[10px] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 uppercase">จ่ายออก</span>
                        ) : (
                          <span className="text-emerald-600 font-black text-[10px] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase">รับเข้า</span>
                        )}
                      </td>
                      <td className={`px-6 py-5 text-right font-black text-base ${isOut ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isOut ? '-' : '+'}{Number(m.qty).toLocaleString()}
                      </td>
                      
                      {/* ✅ แก้ไข: แสดงเฉพาะชื่อและตำแหน่ง ไม่แสดงรูป */}
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-slate-700">
                          {m.employee?.full_name || m.created_by_name || "SYSTEM"}
                        </div>
                        <div className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-0.5">
                          {m.employee?.role || 'Staff'}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-slate-400 text-[11px] italic font-medium">{m.note || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            แสดง {movements.length} จาก {totalCount} รายการ
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1} 
              onClick={() => { setPage(page-1); loadData(undefined, page-1, searchQuery); }} 
              className="px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4"/> ก่อนหน้า
            </button>
            <button 
              disabled={page >= pageAll} 
              onClick={() => { setPage(page+1); loadData(undefined, page+1, searchQuery); }} 
              className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold flex items-center gap-1"
            >
              ถัดไป <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}