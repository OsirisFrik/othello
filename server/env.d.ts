export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly PORT?: string;
    }
  }
}
