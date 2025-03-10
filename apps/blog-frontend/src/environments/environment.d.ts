export interface Environment {
  production: boolean;
  apiUrl: string;
}

declare global {
  interface Window {
    env: Environment;
  }
}
