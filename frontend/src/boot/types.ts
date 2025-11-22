import type { Pinia } from "pinia";

declare module "@quasar/app-vite" {
  interface BootFileParams {
    pinia?: Pinia;
  }
}
