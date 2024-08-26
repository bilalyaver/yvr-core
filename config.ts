type Config = {
    apiUrl?: string;
    modelsPath?: string;
    apiKey?: string;
    dbUri?: string;
    jwtSecret?: string;
    [key: string]: any;
};

require('dotenv').config();

export function getConfig(): Config {
  return {
      apiUrl: process.env.API_URL,
      apiKey: process.env.API_KEY,
      modelsPath: process.env.MODELS_PATH,
      dbUri: process.env.DB_URI,
      jwtSecret: process.env.JWT_SECRET
      // Diğer çevresel değişkenler burada eklenebilir
  };
}