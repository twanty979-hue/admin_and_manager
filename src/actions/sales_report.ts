"use server"

import { createClient } from "../lib/supabase/server"

// --- Helper: Check Auth ---
async function checkAuth(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ")
  return user
}

// 1. ดึง Profile + Role (ใช้ร่วมกันทั้ง Admin/Manager ได้)
export async function getUserProfile() {
  const supabase = await createClient()
  try {
    const user = await checkAuth(supabase)

    const { data: pf, error } = await supabase
      .from("profiles")
      .select("branch_id, full_name, role, branches(branch_name)")
      .eq("user_id", user.id)
      .single()

    if (error) throw new Error(error.message)

    return { 
      user: { id: user.id, email: user.email }, 
      profile: {
        branch_id: pf.branch_id || 1,
        // @ts-ignore
        branch_name: pf.branches?.branch_name || "Unknown Branch",
        full_name: pf.full_name || user.email,
        role: pf.role 
      }, 
      error: null 
    }
  } catch (err: any) {
    return { user: null, profile: null, error: err.message }
  }
}

// 2. ดึงข้อมูลรายงานยอดขาย (Smart Filter)
export async function getSalesReport(
  mode: "day" | "month" | "year",
  year: number,
  month: number,
  requestedBranchId: string // Admin ส่ง "ALL" ได้, แต่ Manager จะถูก Override
) {
  const supabase = await createClient()
  
  try {
    const user = await checkAuth(supabase)

    // 🕵️‍♀️ ตรวจสอบ Role ของคนเรียกก่อน
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, branch_id")
      .eq("user_id", user.id)
      .single()

    // ✨ Security Logic: บังคับสาขาตามสิทธิ์
    let targetBranchId = requestedBranchId
    
    if (profile?.role === 'manager' || profile?.role === 'staff') {
        // ถ้าเป็น Manager/Staff บังคับดูได้แค่สาขาตัวเองเท่านั้น!
        targetBranchId = String(profile.branch_id)
    }
    // ถ้าเป็น Admin ปล่อยผ่าน (ใช้ค่าที่ส่งมาได้เลย)

    // --- คำนวณช่วงเวลา ---
    const pad2 = (n: number) => String(n).padStart(2, "0")
    let fromDate = "", toDate = ""

    if (mode === "day") {
      fromDate = `${year}-${pad2(month)}-01`
      const lastDay = new Date(year, month, 0).getDate()
      toDate = `${year}-${pad2(month)}-${pad2(lastDay)}`
    } else if (mode === "month") {
      fromDate = `${year}-01-01`
      toDate = `${year}-12-31`
    } else {
      fromDate = `${year - 4}-01-01`
      toDate = `${year}-12-31`
    }

    // --- Query Data ---
    let query = supabase
      .from("sale_dasbrode")
      .select(`
        day, branch_id, bills, subtotal, discount, vat_amount, 
        total, cash_total, promptpay_total, note, closed_at,
        branches ( branch_name )
      `)
      .gte("day", fromDate)
      .lte("day", toDate)
      .order("day", { ascending: true })

    // Apply Filter ที่ผ่านการตรวจสอบแล้ว
    if (targetBranchId !== "ALL") {
      query = query.eq("branch_id", Number(targetBranchId))
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    return { data: data || [], error: null }

  } catch (err: any) {
    console.error("Sales Report Error:", err.message)
    return { data: [], error: err.message }
  }
}

// ✅ 3. [กู้คืน] ดึงรายชื่อสาขา (สำหรับ Dropdown ในหน้า Admin)
export async function getReportBranches() {
    const supabase = await createClient()
    try {
        await checkAuth(supabase)
        const { data } = await supabase.from("branches").select("id, branch_name").order("id")
        return data || []
    } catch (err) {
        console.error("Fetch Branches Error:", err)
        return []
    }
}