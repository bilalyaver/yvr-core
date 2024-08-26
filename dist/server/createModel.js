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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Mongoose model oluşturma
async function createModel(schemaJson) {
    const { model, fields } = schemaJson;
    // 1. Mongoose Schema oluşturulması
    const schemaDefinition = {};
    Object.keys(fields).forEach(field => {
        schemaDefinition[field] = {
            type: fields[field].type,
            required: fields[field].required || false,
            unique: fields[field].unique || false,
            select: field === 'password' ? false : true // 'password' için select: false
        };
    });
    const schema = new mongoose_1.Schema(schemaDefinition);
    let Model;
    try {
        // Eğer model daha önce tanımlandıysa, mevcut modeli kullan
        Model = mongoose_1.default.model(model.name);
    }
    catch (error) {
        // Eğer model tanımlı değilse, yeni bir model oluştur
        Model = mongoose_1.default.model(model.name, schema);
        // schema.json dosyasını src/schema dizinine oluşturma
        const schemaDir = path_1.default.resolve(__dirname, 'src/schema');
        const schemaFilePath = path_1.default.resolve(schemaDir, `${model.name}.json`);
        // Eğer src/schema dizini yoksa, oluştur
        if (!fs_1.default.existsSync(schemaDir)) {
            fs_1.default.mkdirSync(schemaDir, { recursive: true });
        }
        // schemaDefinition'ı schema.json dosyasına yazma
        const schemaJsonToSave = {
            model: {
                name: model.name,
                description: model.description,
                displayName: model.displayName,
            },
            fields: schemaDefinition
        };
        fs_1.default.writeFileSync(schemaFilePath, JSON.stringify(schemaJsonToSave, null, 2));
        console.log(`${model.name}.json dosyası ${schemaFilePath} konumunda oluşturuldu.`);
    }
    return Model;
}
exports.default = createModel;
