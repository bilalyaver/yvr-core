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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = require("../config");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Mongoose bağlantısı
const config = (0, config_1.getConfig)();
mongoose_1.default.connect(config.dbUri || 'mongodb://localhost:27017/nodejs', {});
function createController(schemaJson) {
    const { model, fields } = schemaJson;
    // 1. Mongoose Schema oluşturulması
    const schemaDefinition = {};
    fields.forEach(field => {
        schemaDefinition[field.name] = {
            type: field.type,
            required: field.required || false,
            unique: field.unique || false,
            select: field.name === 'password' ? false : true // Eğer alan password ise select: false olarak ayarlanır
        };
        // Eğer alan bir password ise, hashle
        if (field.name === 'password') {
            schemaDefinition[field.name].set = (value) => {
                return bcrypt_1.default.hashSync(value, 10);
            };
        }
        // Eğer alan bir ObjectId ise, referans alanı olarak ayarla
        if (field.type === 'ObjectId') {
            schemaDefinition[field.name].ref = field.name;
        }
    });
    const schema = new mongoose_1.Schema(schemaDefinition);
    // 2. Mongoose Model oluşturulması
    let Model;
    try {
        // Eğer model daha önce tanımlandıysa, mevcut modeli kullan
        Model = mongoose_1.default.model(model.name);
    }
    catch (error) {
        // Eğer model tanımlı değilse, yeni bir model oluştur
        Model = mongoose_1.default.model(model.name, schema);
    }
    // 3. CRUD Fonksiyonları
    return {
        async createItem(data) {
            const newItem = new Model(data);
            return await newItem.save();
        },
        async getItem(id) {
            return await Model.findById(id).exec();
        },
        async updateItem(id, data) {
            return await Model.findByIdAndUpdate(id, data, { new: true }).exec();
        },
        async deleteItem(id) {
            return await Model.findByIdAndDelete(id).exec();
        },
        async getAllItems(filter = {}, options = {}) {
            const list = await Model.find(filter, null, options).exec();
            const count = await Model.countDocuments(filter);
            const data = { count, list };
            return data;
        }
    };
}
exports.default = createController;
