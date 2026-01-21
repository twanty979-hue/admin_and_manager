"use client"

import { useState } from "react"
import { updateMyProfile } from "../../../actions/profiles"
import { Loader2, Save, User, Camera, Shield, Building, Mail, Phone } from "lucide-react"
// ❌ เอา Image ของ Next.js ออก เพื่อความยืดหยุ่นและรองรับ onError
// import Image from "next/image"

const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            resolve(file);
          }
        }, "image/webp", 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export default function ProfileForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(
    profile.avatar_full_url || null // รับค่าที่ถูกต้องมาจาก Server Page แล้ว
  )

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    const file = formData.get('avatar') as File;
    if (file && file.size > 0) {
      try {
        const webpFile = await convertToWebP(file);
        formData.set('avatar', webpFile);
      } catch (err) {
        console.error("Conversion failed", err);
      }
    }
    // ส่ง path เก่าไปลบด้วย (ถ้ามี)
    if (profile.avatar_url) {
        formData.append('old_avatar_path', profile.avatar_url)
    }

    const res = await updateMyProfile(formData)
    setLoading(false)

    if (res?.error) {
      alert("Error: " + res.error)
    } else {
      alert("✅ บันทึกข้อมูลเรียบร้อย!")
      window.location.reload()
    }
  }

  const readOnlyClass = "w-full mt-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 text-sm font-mono cursor-not-allowed focus:outline-none"
  const editableClass = "w-full mt-1 bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"

  return (
    <div className="max-w-4xl mx-auto">
      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- ส่วนรูปโปรไฟล์ --- */}
        <div className="md:col-span-1 flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 relative flex items-center justify-center">
              {preview ? (
                // ✅ ใช้ <img> ธรรมดา พร้อม onError เพื่อกันรูปแตก
                <img 
                    src={preview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                        e.currentTarget.style.display = 'none'; // ซ่อนรูปที่พัง
                        // หรือเปลี่ยน src เป็น placeholder:
                        // e.currentTarget.src = "https://ui-avatars.com/api/?name=User";
                        // หรือให้แสดง icon แทน (ต้องจัดการ CSS เพิ่ม)
                    }}
                />
              ) : null}
              
              {/* Fallback Icon ถ้าไม่มีรูปหรือรูปโหลดไม่ได้ */}
              {(!preview) && (
                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100 absolute inset-0 -z-10">
                  <User className="w-20 h-20" />
                </div>
              )}
            </div>
            
            <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-md transition-all active:scale-95 border-2 border-white">
              <Camera className="w-5 h-5" />
              <input type="file" name="avatar" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div className="text-center w-full">
            <h2 className="text-xl font-bold text-slate-800">{profile.full_name || "ไม่ระบุชื่อ"}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase flex items-center gap-1">
                <Shield className="w-3 h-3" /> {profile.role}
              </span>
            </div>
          </div>
        </div>

        {/* --- ข้อมูลส่วนตัว --- */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600"/> ข้อมูลส่วนตัว
          </h3>
          
          <div className="space-y-5">
            <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Mail className="w-3 h-3"/> อีเมล</label>
                 <input readOnly value={profile.email || "-"} className={readOnlyClass} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3"/> ชื่อ-นามสกุล</label>
              <input name="full_name" defaultValue={profile.full_name || ""} required className={editableClass} />
            </div>

            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Phone className="w-3 h-3"/> เบอร์โทรศัพท์</label>
                <input name="phone" defaultValue={profile.phone || ""} placeholder="08xxxxxxxx" className={editableClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">วันเกิด</label>
                <input name="birth_date" type="date" defaultValue={profile.birth_date || ""} readOnly className={readOnlyClass} />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เลขบัตรประชาชน</label>
                <input name="citizen_id" defaultValue={profile.citizen_id || ""} readOnly className={readOnlyClass} />
              </div>
            </div>
            
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Building className="w-3 h-3"/> สาขา</label>
                <div className={readOnlyClass}>{profile.branches?.branch_name || "-"}</div>
            </div>

            <div className="pt-6 flex justify-end">
               <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 font-bold disabled:opacity-70 active:scale-95 text-sm">
                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                 บันทึกการเปลี่ยนแปลง
               </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  )
}