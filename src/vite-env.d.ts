/// <reference types="vite/client" />

declare global {
  interface Window {
    gc?: () => void;
  }
}
