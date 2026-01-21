"use server"

import { createClient } from "../lib/supabase/server"
import { revalidatePath } from "next/cache"

const BUCKET_NAME = 'profiles' 
const TABLE_NAME = 'profiles'

export async function getMyProfile() {
  const supabase = await createClient()
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    // ✅ แก้ไขตรง select: เพิ่ม branch_id และดึง branch_code จากตาราง branches
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        full_name, 
        phone, 
        avatar_url, 
        email, 
        role, 
        user_id,
        branch_id, 
        branches (
          branch_name,
          branch_code
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (error) throw new Error(error.message)

    return { 
      data: {
        ...data,
        // @ts-ignore
        branch_name: data.branches?.branch_name || "ไม่ระบุ",
        // @ts-ignore
        branch_code: data.branches?.branch_code || "-" // ✅ เตรียมค่า branch_code ไว้ใช้
      }, 
      error: null 
    }
  } catch (err: any) {
    return { data: null, error: err.message }
  }
}

// 2. อัปเดตข้อมูล
export async function updateMyProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }

  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const avatarFile = formData.get('avatar') as File
  const oldAvatarPath = formData.get('old_avatar_path') as string // ค่าที่ส่งมาจากหน้าบ้านคือ profiles/xxxx.webp

  let newAvatarPath = undefined

  // --- กรณีมีการเปลี่ยนรูป ---
  if (avatarFile && avatarFile.size > 0) {
    
    // 1. ลบรูปเก่า (ถ้ามี)
    if (oldAvatarPath) {
      // oldAvatarPath = "profiles/old-file.webp"
      // แต่ใน Bucket ไฟล์ชื่อแค่ "old-file.webp"
      // ดังนั้นต้องตัด "profiles/" ออกก่อนส่งให้ฟังก์ชัน remove
      const cleanPath = oldAvatarPath.replace(`${BUCKET_NAME}/`, '')
      
      await supabase.storage.from(BUCKET_NAME).remove([cleanPath])
    }

    // 2. ตั้งชื่อไฟล์ใหม่
    const fileExt = "webp"
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = fileName // ชื่อไฟล์เพียวๆ สำหรับ Storage

    // 3. อัปโหลด
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, avatarFile, { 
        upsert: true,
        contentType: 'image/webp'
      })

    if (uploadError) return { error: "อัปโหลดรูปไม่ผ่าน: " + uploadError.message }
    
    // 4. ✅ บันทึกลง DB: เติมชื่อ Bucket นำหน้าตามที่คุณต้องการ
    // ผลลัพธ์: profiles/user-id-timestamp.webp
    newAvatarPath = `${BUCKET_NAME}/${filePath}`
  }

  // เตรียมข้อมูลอัปเดต
  const updates: any = {
    full_name: fullName,
    phone: phone,
  }
  
  if (newAvatarPath) updates.avatar_url = newAvatarPath

  const { error: dbError } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('user_id', user.id)

  if (dbError) return { error: "บันทึกข้อมูลไม่สำเร็จ: " + dbError.message }

  revalidatePath('/manager/profiles')
  revalidatePath('/profiles') 
  
  return { success: true }
}