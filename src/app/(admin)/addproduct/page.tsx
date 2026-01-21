import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      
      {/* Icon ใหญ่ๆ */}
      <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <Construction className="w-12 h-12" />
      </div>

      {/* ข้อความหลัก */}
      <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
        ฟีเจอร์นี้กำลังมา... (รออัพเดต)
      </h1>
      
      <p className="text-slate-500 text-lg max-w-md mx-auto mb-8">
        เรากำลังพัฒนาระบบเพิ่มสินค้าให้ดียิ่งขึ้น รองรับการตัดสต็อกแบบ Real-time และการจัดการหลายสาขา
      </p>

      {/* ปุ่มกลับ */}
      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        กลับไปหน้า Dashboard
      </Link>

    </div>
  );
}