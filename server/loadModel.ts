import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import slugify from 'slugify';

// Field interface tanımlaması
export interface Field {
    name: string;
    type: any;
    required?: boolean;
    unique?: boolean;
    select?: boolean;
    ref?: string;
    referenceSchema?: string;
    slugSource?: string;
}

// SchemaJson interface tanımlaması
export interface SchemaJson {
    model: {
        name: string;
        description: string;
        displayName: string;
    };
    fields: Field[];
}

// Model yükleme fonksiyonu
export function loadModel<T extends Document>(schemaJson: SchemaJson): Model<T> {
    const { model, fields } = schemaJson;

    // Eğer fieldlardan birinin type'ı media ise mongoose.Schema.Types.ObjectId olarak tanımla
    fields.forEach(field => {
        if (field.type == 'Media') {
            field.type = 'ObjectId';
            field.referenceSchema = 'Media';
        }

        if (field.type == 'Slug') {
            field.type = 'String';
        }
    });

    // Mongoose Schema oluşturulması
    const schemaDefinition: Record<string, any> = {};

    fields.forEach(field => {
        let fieldType: any;

        // Eğer alan ObjectId ise, doğru tipi belirle
        if (field.type === 'ObjectId' && field.referenceSchema) {
            fieldType = mongoose.Schema.Types.ObjectId;
        } else if (mongoose.Schema.Types[field.type as keyof typeof mongoose.Schema.Types]) {
            // Eğer alan, Mongoose'un tanıdığı bir tip ise, doğru tipi kullan
            fieldType = mongoose.Schema.Types[field.type as keyof typeof mongoose.Schema.Types];
        } else {
            // Eğer alan tipi tanınmıyorsa, düz string olarak kullan
            fieldType = field.type;
        }

        const fieldDefinition: any = {
            type: fieldType,
            required: field.required || false,
            unique: field.unique || false,
            select: field.name === 'password' ? false : true,  // Eğer alan password ise select: false olarak ayarlanır
        };

        // Eğer alan bir ObjectId ise, referans alanını ayarla
        if (field.type === 'ObjectId' && field.referenceSchema) {
            fieldDefinition.ref = field.referenceSchema;
        }

        // Eğer alan bir password ise, hashle
        if (field.name === 'password') {
            fieldDefinition.set = (value: string) => {
                return bcrypt.hashSync(value, 10);
            };
        }

        // Eğer alan bir slug ise, slugify yap
        if (field.type === 'Slug') {
            const slugSource = field.slugSource;
            if(!slugSource) {
                throw new Error('Slug source field is required for slug fields');
            }
            
            fieldDefinition.set = (value: string) => {
                return slugify(fields.find(f => f.name == slugSource)?.name || new Date().getTime().toString(), 
                { lower: true, remove: /[*+~.()'"!:@]/g });
            };
        }


        schemaDefinition[field.name] = fieldDefinition;
    });

    const schema = new Schema<T>(schemaDefinition, { timestamps: true });

    // Mongoose Model oluşturulması
    let Model: Model<T>;
    try {
        // Eğer model daha önce tanımlandıysa, mevcut modeli kullan
        Model = mongoose.model<T>(model.name);
    } catch (error) {
        // Eğer model tanımlı değilse, yeni bir model oluştur
        Model = mongoose.model<T>(model.name, schema);
    }

    return Model;
}