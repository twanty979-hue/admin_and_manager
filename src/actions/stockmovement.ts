"use server"

import { supabaseAdmin } from "../lib/supabase/admin";
import { createClient } from "../lib/supabase/server";

export interface StockMovement {
  id: number;
  type: string;
  qty: number;
  note: string | null;
  created_at_ts: string;
  created_by_name: string | null;
  // ข้อมูลสินค้า (Join ผ่าน stock_movements_product_fk)
  products: {
    name: string;
    sku: string;
    unit: string;
  } | null;
  // ข้อมูลสาขา (Join ปกติ)
  branches: {
    branch_name: string;
  } | null;
  // ข้อมูลพนักงาน (Join ผ่าน stock_movements_created_by_fkey)
  employee: {
    full_name: string | null;
    role: string;
    avatar_url: string | null;
  } | null;
}

// src/actions/stockmovement.ts

export async function getDetailedStockMovements(
  branchId?: number, 
  page: number = 1,
  query: string = ""
) {
  const pageSize = 30;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // ✅ ต้องใช้สตริงที่สะอาด ไม่มีคอมเมนต์ภาษาไทยปนอยู่ครับ
    let dbQuery = supabaseAdmin
      .from("stock_movements")
      .select(`
        id,
        type,
        qty,
        note,
        created_at_ts,
        created_by_name,
        products:product_id_bigint (name, sku, unit),
        branches:branch_id (branch_name),
        employee:profiles!stock_movements_created_by_fkey (full_name, role, avatar_url)
      `, { count: "exact" })
      .order("created_at_ts", { ascending: false });

    if (branchId) {
      dbQuery = dbQuery.eq("branch_id", branchId);
    }

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`, { referencedTable: 'products' });
    }

    const { data, count, error } = await dbQuery.range(from, to);
    
    if (error) {
      console.error("SQL Error Details:", error);
      throw error;
    }

    return { 
      data: data as unknown as StockMovement[], 
      totalCount: count || 0,
      page 
    };
  } catch (error: any) {
    return { error: error.message, data: [], totalCount: 0 };
  }
}

export async function getMyProfile() {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };
    
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("branch_id, full_name, role, branches(branch_name)")
      .eq("user_id", user.id)
      .single();
      
    return { data: profile };
  } catch (err: any) {
    return { error: err.message };
  }
}