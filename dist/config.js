"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
require('dotenv').config();
function getConfig() {
    return {
        apiUrl: process.env.API_URL,
        apiKey: process.env.API_KEY,
        modelsPath: process.env.MODELS_PATH,
        dbUri: process.env.DB_URI,
        jwtSecret: process.env.JWT_SECRET
        // Diğer çevresel değişkenler burada eklenebilir
    };
}
exports.getConfig = getConfig;
