
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    dedupe: ['@emotion/react', '@emotion/styled'],
    alias: {
      global: 'globalThis'
    }
  },
  optimizeDeps: {
    include: ['sockjs-client', '@emotion/react', '@emotion/styled', '@mui/material']
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "react-toastify"],
          admin: [
            "./src/component/admin/AdminPage.jsx",
            "./src/component/admin/AdminCategory.jsx",
            "./src/component/admin/EditCategory.jsx",
            "./src/component/admin/AddCategory.jsx",
            "./src/component/admin/AdminProduct.jsx",
            "./src/component/admin/AddProduct.jsx",
            "./src/component/admin/EditProduct.jsx",
            "./src/component/admin/AdminOrder.jsx",
            "./src/component/admin/AdminOrderDetails.jsx",
            "./src/component/admin/AdminSupportPage.jsx",
            "./src/component/admin/DeleteSupport.jsx",
            "./src/component/admin/AdminReview.jsx",
            "./src/component/admin/AdminAllUsers.jsx",
            "./src/component/admin/AdminDeals.jsx",
          ],
          support: [
            "./src/component/support/SupportPage.jsx",
            "./src/component/support/SupportOrder.jsx",
            "./src/component/support/SupportCustomerSupport.jsx",
            "./src/component/support/SupportReview.jsx",
          ],
          seller: [
            "./src/component/company/LandingPage.jsx",
            "./src/component/company/SellerDashboard.jsx",
            "./src/component/company/SellerProduct.jsx",
            "./src/component/company/SellerAddProduct.jsx",
            "./src/component/company/SellerEditProduct.jsx",
            "./src/component/company/SellerOrderDetails.jsx",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
