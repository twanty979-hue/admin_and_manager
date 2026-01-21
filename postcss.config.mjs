/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},   // 👈 ต้องเขียนว่า tailwindcss เฉยๆ (ห้ามมี @ หรือ /postcss)
    autoprefixer: {},
  },
};

export default config;