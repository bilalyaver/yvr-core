import mongoose, { Document, FilterQuery, Model, Schema } from 'mongoose';
import { getConfig } from '../../config';
import bcrypt from 'bcrypt';
import loadSchema from '../loadSchema';
import { loadModel } from '../loadModel';

// Field type tanımlaması
export interface Field {
    name: string;  // Field ismi
    type: any;     // Field tipi
    required?: boolean;
    unique?: boolean;
    select?: boolean;
    ref?: string;
    referenceSchema?: string;
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
mongoose.connect(config.dbUri || 'mongodb://localhost:27017/nodejs', {});

// CRUD fonksiyonlarını içeren interface
export interface Controller<T extends Document> {
    createItem(data: Partial<T>): Promise<T>;
    getItem(filter?: { id?: string; slug?: string }, populateFields?: string[]): Promise<T | null>;
    updateItem(id: string, data: Partial<T>): Promise<T | null>;
    deleteItem(id: string): Promise<T | null>;
    getAllItems(filter?: Partial<T>, options?: Record<string, unknown>, populateFields?: string[]): Promise<T>;
}

function createController<T extends Document>(schemaJson: SchemaJson): Controller<T> {

    const Model = loadModel<T>(schemaJson);

    // 3. CRUD Fonksiyonları
    return {
        async createItem(data: Partial<T>): Promise<T> {
            const newItem = new Model(data);
            return await newItem.save();
        },
        async getItem(filter: { id?: string; slug?: string }, populateFields: string[] = []): Promise<T | null> {
            let query: any = {};

            if (filter.id) {
                query._id = filter.id;
            }
            if (filter.slug) {
                query.slug = filter.slug;
            }

            let itemQuery = Model.findOne(query).setOptions({ strictPopulate: false });

            if (populateFields.length > 0) {
                populateFields.forEach(field => {
                    const mainSchemaJsonField = schemaJson.fields.find(f => f.name == field);
                    const itemSchemaJson = loadSchema(mainSchemaJsonField?.referenceSchema || '');
                    if (!itemSchemaJson) {
                        return;
                    }
                    loadModel<T>(itemSchemaJson);
                    itemQuery = itemQuery.populate(field);
                });
            }

            return await itemQuery.exec();
        },
        async updateItem(id: string, data: Partial<T>): Promise<T | null> {
            return await Model.findByIdAndUpdate(id, data, { new: true }).exec();
        },
        async deleteItem(id: string): Promise<T | null> {
            return await Model.findByIdAndDelete(id).exec();
        },
        async getAllItems(filter: FilterQuery<T> = {}, options: Record<string, unknown> = {}, populateFields: string[] = []): Promise<T> {
            let query = Model.find(filter, null, options).setOptions({ strictPopulate: false });

            if (populateFields.length > 0) {

                populateFields.forEach(field => {
                    const mainSchemaJsonField = schemaJson.fields.find(f => f.name == field);
                    const itemSchemaJson = loadSchema(mainSchemaJsonField?.referenceSchema || '');
                    if (!itemSchemaJson) {
                        return;
                    }
                    loadModel<T>(itemSchemaJson);
                    query = query.populate(field);
                });
            }

            const list = await query.exec();
            const count = await Model.countDocuments(filter);
            const data = { count, list };
            return data as unknown as T;
        }
    };
}


export default createController;