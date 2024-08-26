"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const ConfigError_1 = __importDefault(require("../common/ConfigError"));
function loadModels(modelsPath) {
    const config = (0, config_1.getConfig)();
    const effectivePath = modelsPath || process.env.MODELS_PATH || config.modelsPath;
    if (!effectivePath) {
        throw new ConfigError_1.default("The required environment variable MODELS_PATH is not. Please make sure that the required environment variables are set correctly in your .env file");
    }
    const absolutePath = path_1.default.resolve(effectivePath);
    const models = {};
    fs_1.default.readdirSync(absolutePath).forEach((file) => {
        const name = file.split('.')[0];
        const model = require(path_1.default.join(absolutePath, file));
        models[name] = model;
    });
    return models;
}
exports.default = loadModels;
