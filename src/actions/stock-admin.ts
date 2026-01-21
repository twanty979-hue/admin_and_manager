// src/actions/stock-admin.ts
"use server"

import { supabaseAdmin } from "../lib/supabase/admin";

export async function getAllInventory(query: string = "") {
  try {
    const dbQuery = supabaseAdmin
      .from("stock")
      .select(`
        id,
        qty,
        updated_at,
        products:product_id (name, sku, barcode, unit),
        branches:branch_id (branch_name, branch_code)
      `, { count: "exact" }) // เพิ่มการนับจำนวนแถว
      .order("updated_at", { ascending: false });

    if (query) {
      dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`, { referencedTable: 'products' });
    }

    const { data, error, count } = await dbQuery;

    // ✅ เพิ่ม Log เพื่อดูผลลัพธ์ใน Terminal ของคุณ
    console.log("Admin Stock Check:", { dataLength: data?.length, error, count });

    if (error) throw error;
    
    return { 
      data: data as unknown as AdminStockData[], 
      totalCount: count || 0 
    };
  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    return { error: error.message, data: [], totalCount: 0 };
  }
}