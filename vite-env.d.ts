/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 修复核心：显式声明全局变量 process
// 这样 geminiService.ts 才能编译成功，App.tsx 才能找到它
declare global {
  var process: {
    env: {
      API_KEY: string;
      [key: string]: string | undefined;
    }
  };
}

export {};