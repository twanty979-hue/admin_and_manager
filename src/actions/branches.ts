"use server"

// ใช้ Relative Path ตามที่คุณต้องการ
import { createClient } from "../lib/supabase/server"
import { revalidatePath } from "next/cache"

const TABLE = 'branches'

/**
 * 1. สร้างสาขาใหม่
 */
export async function createBranch(formData: FormData) {
  const supabase = await createClient()
  
  const branch_code = (formData.get('branch_code') as string || "").trim().toUpperCase().replace(/\s+/g, "")
  const branch_name = (formData.get('branch_name') as string || "").trim()

  if (!branch_code || !branch_name) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" }
  }

  // เช็คซ้ำ
  const { data: dup } = await supabase
    .from(TABLE)
    .select('id')
    .eq('branch_code', branch_code)
    .single()

  if (dup) {
    return { error: `รหัสสาขา ${branch_code} มีอยู่แล้ว` }
  }

  // Insert
  const { error } = await supabase
    .from(TABLE)
    .insert([{ branch_code, branch_name }])

  if (error) return { error: error.message }

  revalidatePath('/branches')
  return { success: true, message: `เพิ่มสาขา ${branch_code} เรียบร้อย` }
}

/**
 * 2. ลบสาขา (เหลือไว้เพียงอันเดียว)
 */
export async function deleteBranch(id: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Delete Error:", error.message)
    return { error: "ไม่สามารถลบข้อมูลได้" }
  }

  revalidatePath('/branches')
  return { success: true }
}