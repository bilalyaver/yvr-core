"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const ConfigError_1 = __importDefault(require("../common/ConfigError"));
function loadSchema(schemaName) {
    try {
        const effectivePath = "src/schemas";
        if (!effectivePath) {
            throw new ConfigError_1.default("The required environment variable MODELS_PATH is not. Please make sure that the required environment variables are set correctly in your .env file");
        }
        const absolutePath = path_1.default.resolve(effectivePath);
        const schema = require(path_1.default.join(absolutePath, schemaName));
        if (!schema) {
            throw new ConfigError_1.default(`Schema not found: ${schemaName}`);
        }
        return schema || null;
    }
    catch (error) {
        return null;
    }
}
exports.default = loadSchema;
