"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createController_1 = __importDefault(require("./createController"));
const loadSchema_1 = __importDefault(require("./loadSchema"));
const config_1 = require("../config");
const userSchema = (0, loadSchema_1.default)('user');
const userController = (0, createController_1.default)(userSchema);
async function login(req, res) {
    const { email, password } = req.body;
    try {
        // Kullanıcıyı e-posta adresi ile bul
        const user = await userController.getAllItems({ email });
        if (!user || user?.list?.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        // Şifreyi doğrulamak için password alanını seç
        const userWithPassword = await userController.getAllItems({ email }, { select: 'password' });
        const isMatch = await bcrypt_1.default.compare(password, userWithPassword?.list[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const config = (0, config_1.getConfig)();
        const jwtSecret = config.jwtSecret;
        const foundUser = user.list[0];
        // JWT token oluştur
        const token = jsonwebtoken_1.default.sign({
            id: foundUser._id,
            email: foundUser.email,
            name: foundUser.name
        }, jwtSecret || 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token, user: { name: foundUser.name, email: foundUser.email } });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.login = login;
