"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const ConfigError_1 = __importDefault(require("../common/ConfigError"));
const logout_1 = require("./logout");
let { apiUrl, apiKey } = (0, config_1.getConfig)();
if (!apiUrl) {
    throw new ConfigError_1.default("The required environment variable API_URL is not. Please make sure that the required environment variables are set correctly in your next.config file");
}
// Add a request interceptor
const headers = () => {
    return {
        headers: {
            'x-api-key': apiKey
        }
    };
};
apiUrl = apiUrl.replace('/api', '');
apiUrl = `${apiUrl}/schemaManager`;
const schemaManager = {
    loadAll: async () => {
        try {
            const { data } = await axios_1.default.get(`${apiUrl}/all:loadAll`, headers());
            return data;
        }
        catch (error) {
            const statusCode = error?.response?.status;
            if (statusCode === 401) {
                (0, logout_1.logout)();
            }
            return error?.response?.data;
        }
    },
    create: async (modelData, fields) => {
        const schemaDefinition = {
            model: {
                name: modelData.name,
                description: modelData.description,
                displayName: modelData.displayName,
            },
            fields: fields,
        };
        try {
            const result = await axios_1.default.post(`${apiUrl}/${modelData.name}:create`, schemaDefinition, headers());
            return result?.data;
        }
        catch (error) {
            return error?.response?.data;
        }
    },
    update: async (modelData, fields) => {
        const schemaDefinition = {
            model: {
                name: modelData.name,
                description: modelData.description,
                displayName: modelData.displayName,
            },
            fields: fields,
        };
        try {
            const result = await axios_1.default.put(`${apiUrl}/${modelData.name}:update`, schemaDefinition, headers());
            return result?.data;
        }
        catch (error) {
            return error?.response?.data;
        }
    },
    load: async (collectionName) => {
        try {
            const { data } = await axios_1.default.get(`${apiUrl}/${collectionName}:load`, headers());
            return data;
        }
        catch (error) {
            return error?.response?.data;
        }
    }
};
exports.default = schemaManager;
