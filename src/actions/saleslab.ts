"use server"

import { createClient } from "../lib/supabase/server"; // ✅ ใช้ตัวกลางที่ปลอดภัย
import { revalidatePath } from "next/cache";

const TABLE = "products"
const FORCE_SKU_PREFIX = "WOODSLABS"

// 1. ดึงข้อมูลสินค้า (List) - จัดการ URL รูปภาพที่ Server
export async function getInventoryList(
  page: number = 0, 
  limit: number = 12, 
  search: string = "", 
  statusFilter: string = "all"
) {
  const supabase = await createClient();
  
  let query = supabase
    .from(TABLE)
    .select("*", { count: 'exact' })
    .ilike('sku', `${FORCE_SKU_PREFIX}%`)
    .order('updated_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (statusFilter !== 'all') {
    const statusMap: Record<string, string[]> = {
        request: ["on_request"],
        pending: ["pending", "reserved", "hold"],
        sold: ["sold", "archived", "inactive"]
    }
    if (statusMap[statusFilter]) query = query.in('status', statusMap[statusFilter])
  }

  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)

  const { data, count, error } = await query

  // ✅ สร้าง Full URL สำหรับรูปภาพตั้งแต่อยู่ที่ Server
  const processedData = data?.map(item => {
    let fullUrl = null;
    if (item.image_url) {
      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(item.image_url);
      fullUrl = publicUrl.publicUrl;
    }
    return { ...item, image_url: fullUrl };
  });

  return { data: processedData || [], count: count || 0, error: error?.message };
}

// 2. อัปเดตสถานะสินค้า
export async function updateProductStatus(id: number | string, newStatus: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(TABLE)
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/sale_slab')
  return { success: true }
}

// 3. ดึงข้อมูลทั้งหมดเพื่อ Export CSV
export async function getAllProductsForExport(statusFilter: string = "all") {
  const supabase = await createClient();
  let query = supabase.from(TABLE).select("*").ilike('sku', `${FORCE_SKU_PREFIX}%`);

  if (statusFilter !== 'all') {
    const statusMap: Record<string, string[]> = {
        request: ["on_request"],
        pending: ["pending", "reserved", "hold"],
        sold: ["sold", "archived", "inactive"]
    }
    if (statusMap[statusFilter]) query = query.in('status', statusMap[statusFilter])
  }

  const { data, error } = await query.order('sku', { ascending: true });

  // ✅ จัดการ URL รูปภาพสำหรับการ Export
  const processedData = data?.map(item => {
    let fullUrl = "";
    if (item.image_url) {
      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(item.image_url);
      fullUrl = publicUrl.publicUrl;
    }
    return { ...item, image_url: fullUrl };
  });

  return { data: processedData || [], error: error?.message };
}