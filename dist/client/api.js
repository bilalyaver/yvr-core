"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const ConfigError_1 = __importDefault(require("../common/ConfigError"));
const cookies_next_1 = require("cookies-next");
const logout_1 = require("./logout");
let { apiUrl } = (0, config_1.getConfig)();
if (!apiUrl) {
    throw new ConfigError_1.default("The required environment variable API_URL is not. Please make sure that the required environment variables are set correctly in your next.config file");
}
// Add a request interceptor
const headers = () => {
    const token = (0, cookies_next_1.getCookie)('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};
const api = {
    get: async (path) => {
        try {
            console.log('path:', path);
            const { data } = await axios_1.default.get(`${apiUrl}${path}`, headers());
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
    post: async (path, data) => {
        try {
            const result = await axios_1.default.post(`${apiUrl}${path}`, data, headers());
            return result?.data;
        }
        catch (error) {
            return error?.response?.data;
        }
    },
    put: async (path, data) => {
        try {
            const result = await axios_1.default.put(`${apiUrl}${path}`, data, headers());
            return result?.data;
        }
        catch (error) {
            return error?.response?.data;
        }
    },
    delete: async (path) => {
        try {
            const result = await axios_1.default.delete(`${apiUrl}${path}`, headers());
            return result?.data;
        }
        catch (error) {
            return error?.response?.data;
        }
    }
};
exports.default = api;
