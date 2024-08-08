declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EMAIL_USER: string;
      EMAIL_PASSWORD: string;
      EMAIL_SEND_TO: string;
      ACCESS_TOKEN_SECRET: string;
    }
  }
}
export {};
