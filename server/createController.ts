import mongoose, { Document, FilterQuery, Model, Schema } from 'mongoose';
import { getConfig } from '../config';
import bcrypt from 'bcrypt';

// Field type tanımlaması
export interface Field {
    name: string;  // Field ismi
    type: any;     // Field tipi
    required?: boolean;
    unique?: boolean;
    select?: boolean;
}

// SchemaJson interface tanımlaması
export interface SchemaJson {
    model: {
        name: string;
        description: string;
        displayName: string;
    };
    fields: Field[];  // Field bir dizi olarak tanımlanıyor
}

// Mongoose bağlantısı
const config = getConfig();
mongoose.connect(config.dbUri || 'mongodb://localhost:27017/nodejs', {} );

// CRUD fonksiyonlarını içeren interface
export interface Controller<T extends Document> {
    createItem(data: Partial<T>): Promise<T>;
    getItem(id: string): Promise<T | null>;
    updateItem(id: string, data: Partial<T>): Promise<T | null>;
    deleteItem(id: string): Promise<T | null>;
    getAllItems(filter?: Partial<T>, options?: Record<string, unknown>): Promise<T>;
}

function createController<T extends Document>(schemaJson: SchemaJson): Controller<T> {
    const { model, fields } = schemaJson;

    // 1. Mongoose Schema oluşturulması
    const schemaDefinition: Record<string, any> = {};

    fields.forEach(field => {
        schemaDefinition[field.name] = {
            type: field.type,
            required: field.required || false,
            unique: field.unique || false,
            select: field.name === 'password' ? false : true  // Eğer alan password ise select: false olarak ayarlanır
        };

        // Eğer alan bir password ise, hashle
        if (field.name === 'password') {
            schemaDefinition[field.name].set = (value: string) => {
                return bcrypt.hashSync(value, 10);
            };
        }

        // Eğer alan bir ObjectId ise, referans alanı olarak ayarla
        if (field.type === 'ObjectId') {
            schemaDefinition[field.name].ref = field.name;
        }
    });

    const schema = new Schema<T>(schemaDefinition);

    // 2. Mongoose Model oluşturulması
    let Model: Model<T>;
    try {
        // Eğer model daha önce tanımlandıysa, mevcut modeli kullan
        Model = mongoose.model<T>(model.name);
    } catch (error) {
        // Eğer model tanımlı değilse, yeni bir model oluştur
        Model = mongoose.model<T>(model.name, schema);
    }

    // 3. CRUD Fonksiyonları
    return {
        async createItem(data: Partial<T>): Promise<T> {
            const newItem = new Model(data);
            return await newItem.save();
        },
        async getItem(id: string): Promise<T | null> {
            return await Model.findById(id).exec();
        },
        async updateItem(id: string, data: Partial<T>): Promise<T | null> {
            return await Model.findByIdAndUpdate(id, data, { new: true }).exec();
        },
        async deleteItem(id: string): Promise<T | null> {
            return await Model.findByIdAndDelete(id).exec();
        },
        async getAllItems(filter: FilterQuery<T> = {}, options: Record<string, unknown> = {}): Promise<T> {
            const list = await Model.find(filter, null, options).exec();
            const count = await Model.countDocuments(filter); 
            const data = { count, list };
            return data as unknown as T;
        }
    };
}

export default createController;