"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// yvr-core/common/ConfigError.ts
const colorette_1 = require("colorette");
class ConfigError extends Error {
    constructor(message) {
        // Hata mesajını renklendirilmiş ve biçimlendirilmiş bir şekilde oluşturuyoruz
        const errorMessage = `
${(0, colorette_1.bold)((0, colorette_1.underline)((0, colorette_1.red)('yvr-core Configuration Error')))}: ${message}`;
        super(errorMessage);
        // Hatanın ismini belirliyoruz
        this.name = 'ConfigError';
    }
}
exports.default = ConfigError;
