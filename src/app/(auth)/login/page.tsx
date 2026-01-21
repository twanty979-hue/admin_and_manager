"use client"

import { login } from '../../../actions/auth'
import { useState } from 'react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function clientAction(formData: FormData) {
    setLoading(true)
    setError(null)

    // --- ✨ Logic เติม @gmail.com อัตโนมัติ ---
    let email = formData.get('email') as string
    
    // ถ้ามีค่า email และ ไม่มีเครื่องหมาย @ ให้เติม @gmail.com ต่อท้าย
    if (email && !email.includes('@')) {
      email = `${email.trim()}@gmail.com`
      formData.set('email', email) // อัปเดตค่าใน FormData ก่อนส่งไป Server
    }
    // ------------------------------------------

    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // ถ้าสำเร็จ server action จะ redirect ไปเอง ไม่ต้องทำอะไรในนี้
  }

  // สไตล์สำหรับไอคอน
  const iconStyle = { width: '24px', height: '24px' }
  const logoStyle = { width: '40px', height: '40px' }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-[400px]">
        
        {/* ส่วนหัว Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={logoStyle}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Wood Management</h1>
          <p className="text-slate-500 mt-2 text-sm">ระบบจัดการสต็อกและพนักงาน</p>
        </div>

        {/* กล่อง Login Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form action={clientAction} className="space-y-6">
            
            {/* ช่องกรอก Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">บัญชีผู้ใช้งาน</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={iconStyle}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input 
                  name="email" 
                  type="text" 
                  placeholder="admin หรือ admin@wood.com" 
                  required 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* ช่องกรอก Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">รหัสผ่าน</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={iconStyle}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </span>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* ส่วนแสดง Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* ปุ่ม Login */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-xs text-slate-400">
          &copy; 2026 Wood Management System.
        </p>
      </div>
    </div>
  )
}