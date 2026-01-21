import { createClient } from "../../../lib/supabase/server";
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, branches(branch_name)')
    .eq('user_id', user.id)
    .single();

  // ✅ แก้ไข Logic การสร้าง URL ให้ถูกต้องแม่นยำ
  if (profile?.avatar_url) {
    const path = profile.avatar_url;
    // ตรวจสอบว่าเก็บเป็น Full URL อยู่แล้วหรือไม่
    if (path.startsWith('http')) {
        profile.avatar_full_url = path;
    } else {
        // Base URL ของ Storage Public
        const baseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public`;
        
        // เช็คว่าใน DB มีคำว่า profiles/ นำหน้าหรือยัง
        if (path.startsWith('profiles/')) {
            profile.avatar_full_url = `${baseUrl}/${path}`;
        } else {
            profile.avatar_full_url = `${baseUrl}/profiles/${path}`;
        }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto mb-8">
         <h1 className="text-2xl font-black text-slate-800">My Profile</h1>
         <p className="text-slate-500 text-sm">จัดการข้อมูลส่วนตัวของคุณ</p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  )
}