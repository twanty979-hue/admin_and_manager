import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // จุดสำคัญ: สั่งให้ Tailwind วิ่งหา Class ในทุกซอกทุกมุม
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // เพิ่มชุดสีพิเศษ "Wood Admin Blue"
      colors: {
        primary: {
          50: '#f0f9ff',  // ฟ้าจางสุด (พื้นหลังบางจุด)
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // ฟ้ามาตรฐาน
          600: '#0284c7', // ฟ้าเข้ม (ปุ่มกด)
          700: '#0369a1', // ฟ้าเข้มมาก (ตอนเมาส์ชี้)
          800: '#075985',
          900: '#0c4a6e', // ฟ้าเกือบดำ (Sidebar)
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;