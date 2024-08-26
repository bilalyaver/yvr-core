"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
// Projenin kök dizinini belirleme
const rootDir = process.cwd(); // Bu, projenin başlatıldığı dizini döndürür.
const schemaDir = path_1.default.join(rootDir, 'src/schemas');
const actionMethodMap = {
    create: 'POST',
    update: 'PUT',
    load: 'GET',
    loadAll: 'GET'
};
function createSchemaFile(collectionName, modelData, fields) {
    const schemaPath = path_1.default.join(schemaDir, `${collectionName}.json`);
    if (!fs_1.default.existsSync(schemaDir)) {
        fs_1.default.mkdirSync(schemaDir, { recursive: true });
    }
    if (!fs_1.default.existsSync(schemaPath)) {
        fs_1.default.writeFileSync(schemaPath, JSON.stringify({ model: modelData, fields }, null, 2));
        return { message: `Schema for ${collectionName} created.` };
    }
    else {
        return { message: `Schema for ${collectionName} already exists.` };
    }
}
function updateSchemaFile(collectionName, modelData, fields) {
    const schemaPath = path_1.default.join(schemaDir, `${collectionName}.json`);
    if (fs_1.default.existsSync(schemaPath)) {
        fs_1.default.writeFileSync(schemaPath, JSON.stringify({ model: modelData, fields }, null, 2));
        return { message: `Schema for ${collectionName} updated.` };
    }
    else {
        return { message: `Schema for ${collectionName} does not exist.` };
    }
}
function loadSchemaFile(collectionName) {
    const schemaPath = path_1.default.join(schemaDir, `${collectionName}.json`);
    if (fs_1.default.existsSync(schemaPath)) {
        const schema = fs_1.default.readFileSync(schemaPath, 'utf-8');
        return JSON.parse(schema);
    }
    else {
        return { error: `Schema for ${collectionName} does not exist.` };
    }
}
function loadAllSchemas() {
    const schemaFiles = fs_1.default.readdirSync(schemaDir);
    return schemaFiles.map(file => {
        const schema = fs_1.default.readFileSync(path_1.default.join(schemaDir, file), 'utf-8');
        return JSON.parse(schema);
    });
}
async function schemaManager(req, res) {
    let [collectionName, action] = req.path.split(':');
    const apiKey = req.headers['x-api-key'];
    collectionName = collectionName.replace('/', '');
    const config = (0, config_1.getConfig)();
    // API Key doğrulaması
    if (apiKey != config.apiKey) {
        return res.status(403).json({ error: "Access forbidden. Invalid API Key." });
    }
    if (!collectionName || !action) {
        return res.status(400).json({ error: "Invalid path. Please provide collectionName and action." });
    }
    const expectedMethod = actionMethodMap[action];
    if (req.method !== expectedMethod) {
        return res.status(405).json({ error: `Method ${req.method} not allowed for action ${action}. Expected ${expectedMethod}.` });
    }
    try {
        switch (action) {
            case 'create':
                const createResult = createSchemaFile(collectionName, req.body.model, req.body.fields);
                res.json(createResult);
                break;
            case 'update':
                const updateResult = updateSchemaFile(collectionName, req.body.model, req.body.fields);
                res.json(updateResult);
                break;
            case 'load':
                const loadResult = loadSchemaFile(collectionName);
                res.json(loadResult);
                break;
            case 'loadAll':
                const allSchemas = loadAllSchemas();
                res.json(allSchemas);
                break;
            default:
                res.status(404).json({ error: "Action not found" });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
router.use(schemaManager);
exports.default = router;
