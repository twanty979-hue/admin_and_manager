"use server"

import { createClient } from "../lib/supabase/server"
import { revalidatePath } from "next/cache"

const TABLE_NAME = "products"
const STORAGE_BUCKET = "product-images"

// --- Helper เช็คสิทธิ์ (ถ้าไม่ล็อกอิน จะ Error) ---
async function checkAuth(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ")
  return user
}

// ✅ 1. ฟังก์ชันอัปโหลดไฟล์ (ใช้โดย Form)
export async function uploadFile(formData: FormData) {
  const supabase = await createClient()
  // await checkAuth(supabase) // เปิดบรรทัดนี้ถ้าต้องการบังคับล็อกอินก่อนอัปโหลด

  const file = formData.get('file') as File
  const path = formData.get('path') as string

  if (!file || !path) return { error: "Missing file or path" }

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: 'image/webp' })

  if (error) return { error: error.message }
  return { success: true }
}

// ✅ 2. ดึงสินค้าทั้งหมด (List Page ใช้ตัวนี้)
export async function getProducts() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return { data: [], error: error.message }
  }

  // แปลง Path เป็น Full URL
  const processedData = data.map((item) => {
    let publicUrl = null
    if (item.image_url) {
        if(item.image_url.startsWith('http')) {
            publicUrl = item.image_url
        } else {
            const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(item.image_url)
            publicUrl = data.publicUrl
        }
    }
    return { ...item, image_url: publicUrl }
  })

  return { data: processedData, error: null }
}

// ✅ 3. ดึงสินค้าชิ้นเดียว (Edit Page ใช้ตัวนี้)
export async function getProductById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single()

  if (error) return { data: null, error: error.message }

  // 3.1 แปลงรูปหลัก
  if (data.image_url && !data.image_url.startsWith('http')) {
      const { data: imgData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.image_url)
      data.image_url = imgData.publicUrl
  }

  // 3.2 แปลงรูปย่อยใน Gallery
  if (data.specs && Array.isArray(data.specs.images)) {
      data.specs.images = data.specs.images.map((img: any) => {
          if (img.path && !img.path.startsWith('http')) {
              const { data: imgData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(img.path)
              return { ...img, path: imgData.publicUrl }
          }
          return img
      })
  }

  return { data, error: null }
}

// ✅ 4. สร้างสินค้าใหม่
export async function createInitialProduct(productData: any) {
  const supabase = await createClient()
  await checkAuth(supabase) 

  const { data, error } = await supabase.from(TABLE_NAME).insert([productData]).select('id').single()
  if (error) return { error: error.message }
  
  revalidatePath('/inventory')
  return { id: data.id }
}

// ✅ 5. อัปเดตสินค้า
export async function updateProduct(id: string | number, updateData: any) {
  const supabase = await createClient()
  await checkAuth(supabase)

  const { error } = await supabase.from(TABLE_NAME).update(updateData).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/inventory')
  revalidatePath(`/inventory/${id}`)
  return { success: true }
}

// src/actions/woodslab.ts

// ... (ส่วนอื่นๆ เหมือนเดิม)

// ✅ 6. ลบสินค้า (แก้ไขให้ลบ Stock ก่อน)
export async function deleteProduct(id: string | number) {
    const supabase = await createClient()
    await checkAuth(supabase) // 🔒 บังคับล็อกอิน

    // 1. ลบรายการใน Stock ที่ผูกกับสินค้านี้ก่อน (ตารางลูก)
    const { error: stockError } = await supabase
        .from('stock') 
        .delete()
        .eq('product_id', id)

    // (ถ้า stockError เป็นเพราะไม่มีข้อมูล ก็ไม่เป็นไร แต่ถ้า error อื่นอาจต้องเช็ค)
    if (stockError) {
        console.warn("ลบ Stock ไม่สำเร็จ หรือไม่มีข้อมูล:", stockError.message)
        // ไม่ต้อง return error เพราะเราจะพยายามลบสินค้าต่อ
    }

    // 2. ลบสินค้า (ตารางแม่)
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/inventory')
    return { success: true }
}