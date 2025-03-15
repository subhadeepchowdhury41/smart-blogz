declare const process: {
  env: {
    BACKEND_URL: string;
  };
};

export const environment = {
  production: true,
  apiUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api`
};
