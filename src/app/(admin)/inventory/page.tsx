import Link from "next/link"
import { getProducts } from "../../../actions/woodslab" 
import InventoryActions from "../../../components/InventoryActions"
import InventoryTable from "../../../components/InventoryTable" // ✅ Import ตัวใหม่มาใช้
import { Package, Layers, Hammer } from "lucide-react"

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function InventoryPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const activeTab = (resolvedSearchParams.tab as string) || 'SLABS'
  
  const dbCategory = activeTab === 'SLABS' ? 'SLABS' : 'rough_wood'
  const { data: products, error } = await getProducts(dbCategory)

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-600" />
              คลังสินค้า (Inventory)
            </h1>
            <p className="text-slate-500 text-sm mt-1 ml-10">
              จัดการรายการสินค้าทั้งหมดในระบบ
            </p>
          </div>
          <InventoryActions />
        </div>

        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-6">
            <Link 
              href="/inventory?tab=SLABS"
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors
                ${activeTab === 'SLABS' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'}`
              }
            >
              <Layers className="w-4 h-4" /> Wood Slabs (แผ่นไม้)
            </Link>
            <Link 
              href="/inventory?tab=ROUGH"
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors
                ${activeTab === 'ROUGH' 
                  ? 'border-orange-500 text-orange-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'}`
              }
            >
              <Hammer className="w-4 h-4" /> Rough Wood (ไม้ดิบ)
            </Link>
          </div>
        </div>

        {/* ✅ ใช้ InventoryTable แทนการเขียน table ตรงๆ */}
        {error ? (
           <div className="p-8 text-center text-red-500 bg-white rounded-xl border border-red-100">
             Error loading data: {error}
           </div>
        ) : (
           <InventoryTable products={products || []} activeTab={activeTab} />
        )}
        
      </div>
    </div>
  )
}