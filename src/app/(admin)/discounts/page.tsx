import { createClient } from "../../../lib/supabase/server"; // ✅ ดึงกุญแจลับจาก Server
import DiscountClient from "./DiscountUI"; 

export default async function DiscountsPage() {
  const supabase = await createClient();

  // ดึงข้อมูลแบบมิดชิด (Server-side)
  const { data: discounts } = await supabase
    .from('discounts')
    .select('*, discount_rules(*)')
    .order('created_at', { ascending: false });

  const { data: products } = await supabase.from('products').select('id, name');
  const { data: branches } = await supabase.from('branches').select('id, branch_name');

  return (
    <DiscountClient 
      discounts={discounts || []} 
      products={products || []} 
      branches={branches || []} 
    />
  );
}