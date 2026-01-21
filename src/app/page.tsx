// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // เมื่อใครเข้าหน้าแรกสุด ให้ดีดไปหน้า Login ทันที
  redirect('/login');
}