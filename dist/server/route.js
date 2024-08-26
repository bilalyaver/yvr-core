"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loadSchema_1 = __importDefault(require("./loadSchema"));
const router = (0, express_1.Router)();
// Route oluşturma fonksiyonu
function createRoutes(route, crudOperations) {
    const modelName = route.split(':')[0];
    const schema = (0, loadSchema_1.default)(modelName);
    // Get All Items
    router.get(`/${modelName}`, async (req, res) => {
        try {
            const items = await crudOperations.getAllItems();
            res.json(items);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Get Single Item
    router.get(`/${modelName}/:id`, async (req, res) => {
        try {
            const item = await crudOperations.getItem(req.params.id);
            if (!item) {
                return res.status(404).json({ error: `${modelName} not found` });
            }
            res.json(item);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Create Item
    router.post(`/${modelName}`, async (req, res) => {
        try {
            const newItem = await crudOperations.createItem(req.body);
            res.status(201).json(newItem);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Update Item
    router.put(`/${modelName}/:id`, async (req, res) => {
        try {
            const updatedItem = await crudOperations.updateItem(req.params.id, req.body);
            if (!updatedItem) {
                return res.status(404).json({ error: `${modelName} not found` });
            }
            res.json(updatedItem);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Delete Item
    router.delete(`/${modelName}/:id`, async (req, res) => {
        try {
            const deletedItem = await crudOperations.deleteItem(req.params.id);
            if (!deletedItem) {
                return res.status(404).json({ error: `${modelName} not found` });
            }
            res.json(deletedItem);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
exports.default = createRoutes;
