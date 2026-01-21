// src/app/layout.tsx
import "./globals.css"; 
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      {/* เพิ่ม suppressHydrationWarning เพื่อบอก React ว่า 
          ไม่ต้องตกใจถ้ามี Extension มาเติมค่าใน body */}
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}