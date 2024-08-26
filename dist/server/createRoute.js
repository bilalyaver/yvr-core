"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const createController_1 = __importDefault(require("./createController"));
const loadSchema_1 = __importDefault(require("./loadSchema"));
const login_1 = require("./login");
const authMiddleware_1 = require("./authMiddleware");
const splitFilterAndOptions_1 = __importDefault(require("./splitFilterAndOptions"));
const router = (0, express_1.Router)();
const actionMethodMap = {
    getAll: 'GET',
    get: 'GET',
    create: 'POST',
    update: 'PUT',
    delete: 'DELETE',
    login: 'POST'
};
async function createRoute(req, res) {
    let [modelName, action] = req.path.split(':');
    // Query parametrelerini req.query üzerinden alalım
    const queries = req.query;
    const { filters, options } = (0, splitFilterAndOptions_1.default)(queries);
    const schema = (0, loadSchema_1.default)(modelName);
    if (!schema) {
        return res.status(404).json({ error: "Model not found. Please check your schema file" });
    }
    const expectedMethod = actionMethodMap[action];
    if (req.method !== expectedMethod) {
        return res.status(405).json({ error: `Method ${req.method} not allowed for action ${action}. Expected ${expectedMethod}.` });
    }
    const controller = (0, createController_1.default)(schema);
    try {
        const itemId = req.query.id;
        switch (action) {
            case "getAll":
                res.json(await controller.getAllItems(filters, options));
                break;
            case "get":
                const item = await controller.getItem(itemId);
                item ? res.json(item) : res.status(404).json({ error: `${modelName} not found` });
                break;
            case "create":
                res.status(201).json(await controller.createItem(req.body));
                break;
            case "update":
                const updatedItem = await controller.updateItem(itemId, req.body);
                updatedItem ? res.json(updatedItem) : res.status(404).json({ error: `${modelName} not found` });
                break;
            case "delete":
                const deletedItem = await controller.deleteItem(req.params.id);
                deletedItem ? res.json(deletedItem) : res.status(404).json({ error: `${modelName} not found` });
                break;
            case "login":
                await (0, login_1.login)(req, res);
                break;
            default:
                res.status(404).json({ error: "Action not found" });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
router.use(authMiddleware_1.authMiddleware, createRoute);
exports.default = router;
