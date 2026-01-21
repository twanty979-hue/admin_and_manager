import { createClient } from "../../../lib/supabase/server" // ใช้ Relative Path ให้ตรงกับโครงสร้างคุณ
import BranchClient from "./BranchClient"

export default async function BranchesPage() {
  // เรียกใช้ตัวกลางที่รวม Logic การจัดการ Cookies และ Env ลับไว้แล้ว
  const supabase = await createClient()

  // ดึงข้อมูลสาขาทั้งหมด
  const { data: branches } = await supabase
    .from('branches')
    .select('id, branch_code, branch_name, created_at')
    .order('created_at', { ascending: false })

  return (
    <BranchClient initialBranches={branches || []} />
  )
}