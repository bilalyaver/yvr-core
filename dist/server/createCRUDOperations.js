"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = require("../config");
// Mongoose bağlantısı
const config = (0, config_1.getConfig)();
mongoose_1.default.connect(config.dbUri, {});
function createCRUDOperations(schemaJson) {
    const { model, fields } = schemaJson;
    // 1. Mongoose Schema oluşturulması
    const schemaDefinition = {};
    Object.keys(fields).forEach(field => {
        schemaDefinition[field] = {
            type: fields[field].type,
            required: fields[field].required || false,
            unique: fields[field].unique || false,
        };
    });
    const schema = new mongoose_1.Schema(schemaDefinition);
    // 2. Mongoose Model oluşturulması
    const Model = mongoose_1.default.model(model.name, schema);
    // 3. CRUD Fonksiyonları
    return {
        // Create
        async createItem(data) {
            const newItem = new Model(data);
            return await newItem.save();
        },
        // Read
        async getItem(id) {
            return await Model.findById(id).exec();
        },
        // Update
        async updateItem(id, data) {
            return await Model.findByIdAndUpdate(id, data, { new: true }).exec();
        },
        // Delete
        async deleteItem(id) {
            return await Model.findByIdAndDelete(id).exec();
        },
        // List All Items
        async getAllItems(filter = {}, options = {}) {
            return await Model.find(filter, null, options).exec();
        }
    };
}
exports.default = createCRUDOperations;
