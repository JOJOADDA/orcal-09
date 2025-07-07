import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false // تسريع HMR
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // تحسينات البناء للسرعة القصوى
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
    minify: 'esbuild',
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        // تقسيم الكود بذكاء
        manualChunks: {
          // مكتبات UI منفصلة
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-avatar',
            '@radix-ui/react-slot'
          ],
          // مكتبات البيانات
          'data-vendor': [
            '@supabase/supabase-js',
            '@tanstack/react-query'
          ],
          // المكونات الأساسية
          'core-components': [
            'lucide-react',
            'clsx',
            'tailwind-merge'
          ]
        }
      }
    },
    // تحسين حجم الحزم
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 2048, // inline أصول صغيرة
  },
  optimizeDeps: {
    // تحسين التبعيات للتحميل السريع
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react'
    ],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  esbuild: {
    // تحسين esbuild
    target: 'es2020',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    treeShaking: true
  }
}));
