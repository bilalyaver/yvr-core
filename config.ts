type Config = {
    modelsPath?: string;
    publicUrl?: string;
    apiKey?: string;
    dbUri?: string;
    jwtSecret?: string;
    [key: string]: any;
};

require('dotenv').config();

export function getConfig(): Config {
  return {
      apiKey: process.env.API_KEY,
      publicUrl: process.env.PUBLIC_URL,
      modelsPath: process.env.MODELS_PATH,
      dbUri: process.env.DB_URI,
      jwtSecret: process.env.JWT_SECRET,
      // Diğer çevresel değişkenler burada eklenebilir
  };
}