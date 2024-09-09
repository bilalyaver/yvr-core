require('dotenv').config();

type Config = {
    publicUrl?: string;
    apiKey?: string;
    dbUri?: string;
    jwtSecret?: string;
    [key: string]: any;
};

export function getConfig(): Config {
  return {
      apiKey: process.env.API_KEY,
      publicUrl: process.env.PUBLIC_URL,
      dbUri: process.env.DB_URI,
      jwtSecret: process.env.JWT_SECRET,
      // Diğer çevresel değişkenler burada eklenebilir
  };
}