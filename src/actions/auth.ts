"use server";

import { createClient } from "../lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * 1. ฟังก์ชันเข้าสู่ระบบ (Login)
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // ส่งข้อมูลไปตรวจสอบกับ Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login Error:", error.message);
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  // ถ้า Login สำเร็จ ให้ Redirect ไปที่หน้า Dashboard
  // (Middleware จะเป็นตัวตัดสินเองว่า Role ไหนควรไปหน้าไหนต่อ)
  redirect("/dashboard");
}

/**
 * 2. ฟังก์ชันออกจากระบบ (Logout)
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}