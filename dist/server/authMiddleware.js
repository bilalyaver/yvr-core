"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
function authMiddleware(req, res, next) {
    const config = (0, config_1.getConfig)();
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
    const allowedPaths = ['/user:login', '/user:create', '/user:getAll'];
    if (allowedPaths.includes(req.path)) {
        return next();
    }
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config.jwtSecret || 'your_jwt_secret');
        req.user = decoded; // Kullanıcı bilgilerini isteğe ekle
        next(); // Bir sonraki middleware veya route handler'a geç
    }
    catch (ex) {
        res.status(401).json({ error: 'Invalid token.' });
    }
}
exports.authMiddleware = authMiddleware;
