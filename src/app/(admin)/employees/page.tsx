// src/app/(admin)/employees/page.tsx
import { createClient } from "../../../lib/supabase/server";
import { supabaseAdmin } from "../../../lib/supabase/admin"; // ✅ เรียกใช้ admin client
import EmployeeClient from "./EmployeeClient";

export default async function EmployeesPage() {
  // ไม่ต้องใช้ createClient() สำหรับดึง data แล้ว เพราะมันติด RLS
  // const supabase = await createClient(); 

  // 1. ดึงบัญชีจาก Auth (ใช้พลัง Admin) -> อันนี้ถูกแล้ว
  const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    return <div className="p-8 text-center text-red-500">Error: ไม่สามารถดึงข้อมูล User ได้ ({authError.message})</div>;
  }

  // 2. ✅ แก้จุดนี้: ใช้ supabaseAdmin ดึงข้อมูล profiles (ทะลุ RLS)
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('user_id, full_name, role, phone, citizen_id, birth_date, avatar_url, branch_id, branches(id, branch_name, branch_code)');

  // 3. ✅ แก้จุดนี้: ใช้ supabaseAdmin ดึงข้อมูล branches (เผื่อติด RLS เหมือนกัน)
  const { data: branches } = await supabaseAdmin
    .from('branches')
    .select('id, branch_name, branch_code')
    .order('id', { ascending: true });

  // 4. รวมร่างข้อมูล (Logic เดิม)
  const allEmployees = authUsers?.map((user) => {
    // หา profile ที่ user_id ตรงกัน
    // (ตอนนี้ profiles จะมีข้อมูลครบทุกคนแล้ว เพราะใช้ admin ดึง)
    const profile = profiles?.find((p) => p.user_id === user.id);
    
    return {
      user_id: user.id,
      email: user.email || "",
      full_name: profile?.full_name || null, // ถ้ามี profile จะโชว์ชื่อ
      role: profile?.role || "unassigned",
      phone: profile?.phone || null,
      citizen_id: profile?.citizen_id || null,
      birth_date: profile?.birth_date || null,
      avatar_url: profile?.avatar_url || null, 
      branch_id: profile?.branch_id || null,
      branches: profile?.branches || null 
    };
  }) || [];

  const storageBaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public`;

  return (
    <EmployeeClient 
      initialData={allEmployees} 
      branches={branches || []}
      storageBaseUrl={storageBaseUrl} 
    />
  );
}