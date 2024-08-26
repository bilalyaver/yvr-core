"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = void 0;
const cookies_next_1 = require("cookies-next");
const logout = async () => {
    (0, cookies_next_1.deleteCookie)('token');
    window.location.href = '/login';
};
exports.logout = logout;
