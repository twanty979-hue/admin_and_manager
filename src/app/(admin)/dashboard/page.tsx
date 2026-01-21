import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal,
  Calendar
} from 'lucide-react';

export default function DashboardPage() {
  
  // --- ข้อมูลจำลอง (Mock Data) ---
  const stats = [
    {
      label: "ยอดขายรวม",
      value: "฿1,259,300",
      trend: "+12.5%",
      isUp: true,
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "ออเดอร์ทั้งหมด",
      value: "452",
      trend: "+8.2%",
      isUp: true,
      icon: ShoppingBag,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "ลูกค้าใหม่",
      value: "89",
      trend: "-2.4%",
      isUp: false,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "สินค้าในคลัง",
      value: "1,240",
      trend: "+4.1%",
      isUp: true,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const recentOrders = [
    { id: "#ORD-7752", customer: "คุณสมชาย ใจดี", date: "19 Jan 2026", total: "฿12,500", status: "Completed" },
    { id: "#ORD-7751", customer: "บจก. ไม้ไทย", date: "19 Jan 2026", total: "฿45,000", status: "Processing" },
    { id: "#ORD-7750", customer: "คุณอารยา สวย", date: "18 Jan 2026", total: "฿8,900", status: "Completed" },
    { id: "#ORD-7749", customer: "ร้านกาแฟอินดี้", date: "18 Jan 2026", total: "฿22,000", status: "Pending" },
    { id: "#ORD-7748", customer: "คุณวิชัย", date: "17 Jan 2026", total: "฿5,500", status: "Cancelled" },
  ];

  const topProducts = [
    { name: "ไม้ประดู่ แผ่นใหญ่ (Top Grade)", sales: "120 ชิ้น", price: "฿15,000" },
    { name: "ไม้มะค่า (Slab)", sales: "85 ชิ้น", price: "฿8,500" },
    { name: "ไม้สักทอง (ขาโต๊ะ)", sales: "64 ชิ้น", price: "฿4,200" },
    { name: "น้ำยาเคลือบไม้ (Wood Oil)", sales: "210 กระป๋อง", price: "฿850" },
  ];

  // Helper สำหรับสี Status Badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm">ภาพรวมธุรกิจประจำวันที่ 19 ม.ค. 2026</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-600 cursor-pointer hover:bg-slate-50">
           <Calendar className="w-4 h-4" />
           <span>This Month</span>
           <ArrowDown className="w-3 h-3 ml-2" />
        </div>
      </div>

      {/* --- 1. KPI Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${stat.isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {stat.isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.trend}
              </span>
              <span className="ml-2 text-slate-400">จากเดือนที่แล้ว</span>
            </div>
          </div>
        ))}
      </div>

      {/* --- 2. Charts & Top Products --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Overview Chart (จำลองด้วย CSS) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800 text-lg">สถิติยอดขาย (Sales Overview)</h3>
             <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5"/></button>
           </div>
           
           {/* Mock Bar Chart */}
           <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                <div key={i} className="w-full flex flex-col justify-end items-center group cursor-pointer">
                   <div 
                    className="w-full bg-blue-100 rounded-t-lg group-hover:bg-blue-600 transition-all relative" 
                    style={{ height: `${h}%` }}
                   >
                     {/* Tooltip on hover */}
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        ฿{h}k
                     </div>
                   </div>
                </div>
              ))}
           </div>
           {/* X-Axis Label */}
           <div className="flex justify-between mt-2 text-xs text-slate-400 uppercase font-medium px-1">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                <span key={m}>{m}</span>
              ))}
           </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-slate-800 text-lg mb-4">สินค้าขายดี (Top Products)</h3>
           <div className="space-y-4">
             {topProducts.map((product, i) => (
               <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                        {i + 1}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.sales} sold</p>
                     </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{product.price}</span>
               </div>
             ))}
           </div>
           <button className="w-full mt-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 border-t border-slate-100 transition-colors">
              ดูทั้งหมด
           </button>
        </div>
      </div>

      {/* --- 3. Recent Orders Table --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">ออเดอร์ล่าสุด (Recent Orders)</h3>
            <button className="text-sm text-blue-600 hover:underline font-medium">ดูทั้งหมด</button>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
               <tr>
                 <th className="px-6 py-4">Order ID</th>
                 <th className="px-6 py-4">ลูกค้า</th>
                 <th className="px-6 py-4">วันที่</th>
                 <th className="px-6 py-4">ยอดรวม</th>
                 <th className="px-6 py-4">สถานะ</th>
                 <th className="px-6 py-4 text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {recentOrders.map((order, i) => (
                 <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer">
                   <td className="px-6 py-4 font-medium text-slate-800">{order.id}</td>
                   <td className="px-6 py-4 text-slate-600">{order.customer}</td>
                   <td className="px-6 py-4 text-slate-500 text-sm">{order.date}</td>
                   <td className="px-6 py-4 font-medium text-slate-800">{order.total}</td>
                   <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                       {order.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right">
                     <button className="text-slate-400 hover:text-blue-600"><MoreHorizontal className="w-5 h-5"/></button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

    </div>
  );
}