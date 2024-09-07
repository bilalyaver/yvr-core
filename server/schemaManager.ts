import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getConfig } from '../config';

interface FieldDefinition {
    type: string;
    required?: boolean;
    unique?: boolean;
    select?: boolean;
}

interface SchemaDefinition {
    model: {
        name: string;
        description: string;
        displayName: string;
    };
    fields: {
        [key: string]: FieldDefinition;
    };
}

const router = Router();

// Projenin kök dizinini belirleme
const rootDir = process.cwd(); // Bu, projenin başlatıldığı dizini döndürür.
const schemaDir = path.join(rootDir, 'src/schemas');

type Action = 'create' | 'update' | 'load' | 'loadAll';

const actionMethodMap: Record<Action, string> = {
    create: 'POST',
    update: 'PUT',
    load: 'GET',
    loadAll: 'GET'
};


function createSchemaFile(collectionName: string, modelData: { name: string; description: string; displayName: string }, fields: FieldDefinition[]): { message: string } {


    const schemaPath = path.join(schemaDir, `${collectionName}.json`);

    if (!fs.existsSync(schemaDir)) {
        fs.mkdirSync(schemaDir, { recursive: true });
    }

    if (!fs.existsSync(schemaPath)) {
        fs.writeFileSync(schemaPath, JSON.stringify({ model: modelData, fields }, null, 2));
        return { message: `Schema for ${collectionName} created.` };
    } else {
        return { message: `Schema for ${collectionName} already exists.` };
    }
}

function updateSchemaFile(collectionName: string, modelData: { name: string; description: string; displayName: string }, fields: FieldDefinition[]): { message: string } {
    const schemaPath = path.join(schemaDir, `${collectionName}.json`);
    if (fs.existsSync(schemaPath)) {
        fs.writeFileSync(schemaPath, JSON.stringify({ model: modelData, fields }, null, 2));
        return { message: `Schema for ${collectionName} updated.` };
    } else {
        return { message: `Schema for ${collectionName} does not exist.` };
    }
}

function loadSchemaFile(collectionName: string): SchemaDefinition | { error: string } {
    const schemaPath = path.join(schemaDir, `${collectionName}.json`);

    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        return JSON.parse(schema) as SchemaDefinition;
    } else {
        return { error: `Schema for ${collectionName} does not exist.` };
    }
}

function loadAllSchemas(): SchemaDefinition[] {
    const schemaFiles = fs.readdirSync(schemaDir);
    return schemaFiles.map(file => {
        const schema = fs.readFileSync(path.join(schemaDir, file), 'utf-8');
        return JSON.parse(schema) as SchemaDefinition;
    });
}

async function schemaManager(req: Request, res: Response) {
    let [collectionName, action] = req.path.split(':') as [string, Action];
    const apiKeyReq = req.headers['x-api-key'];
    collectionName = collectionName.replace('/', '');

    const { apiKey } = getConfig();

    // API Key doğrulaması
    if (apiKeyReq != apiKey) {
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
                break
            default:
                res.status(404).json({ error: "Action not found" });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

router.use(schemaManager);

export default router;