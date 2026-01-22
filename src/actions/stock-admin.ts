// src/actions/stock-admin.ts
"use server"

import { supabaseAdmin } from "../lib/supabase/admin";

// ✅ แก้ไข Interface ให้ตรงกับสถาปัตยกรรมข้อมูลที่ดึงมาจริง
export interface AdminStockData {
  id: string;
  qty: number;
  updated_at: string;
  products: {
    name: string;
    sku: string;
    barcode: string;
    unit: string;
  } | null;
  branches: {
    branch_name: string;
    branch_code: string;
  } | null;
}

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
      `, { count: "exact" })
      .order("updated_at", { ascending: false });

    if (query) {
      dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`, { referencedTable: 'products' });
    }

    const { data, error, count } = await dbQuery;

    if (error) throw error;
    
    // ✅ Cast ข้อมูลให้ตรงกับ Interface ที่เราแก้ไข
    return { 
      data: (data as any) as AdminStockData[], 
      totalCount: count || 0 
    };
  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    return { error: error.message, data: [], totalCount: 0 };
  }
}