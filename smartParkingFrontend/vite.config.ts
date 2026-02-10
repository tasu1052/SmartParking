// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        // ✅ 기존 /api 프록시 유지
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },

        // ✅ 추가: 현재 프론트에서 직접 호출하는 엔드포인트들도 백엔드로 프록시
        '/parking-lots': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/reservations': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },

        // ✅ (선택) 로그인/유저 API가 /users 같은 경로라면 이것도 추가
        '/users': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        // ✅ (선택) 혹시 /auth 경로 쓰면 추가
        '/auth': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },

        '/admin': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },

    plugins: [react()],

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
