import { Router, Request, Response } from 'express';
import createController from './createController';
import loadSchema from './loadSchema';
import { login } from './login';
import { authMiddleware } from './authMiddleware';
import splitFilterAndOptions from './splitFilterAndOptions';

const router = Router();

type Action = 'getAll' | 'get' | 'create' | 'update' | 'delete' | 'login';

const actionMethodMap: Record<Action, string> = {
    getAll: 'GET',
    get: 'GET',
    create: 'POST',
    update: 'PUT',
    delete: 'DELETE',
    login: 'POST'
};

async function createRoute(req: Request, res: Response) {
    let [modelName, action] = req.path.split(':') as [string, Action];

    modelName = modelName.slice(1); // modelName başındaki / karakterini kaldır
    modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1); // modelName'i baş harfi büyük yap
    
    // Query parametrelerini req.query üzerinden alalım
    const queries = req.query;

    const { filters, options } = splitFilterAndOptions(queries as Record<string, string>);
    const populateFields = req.query.populate ? (req.query.populate as string).split(',') : [];

    const schema = loadSchema(modelName);
    if (!schema) {
        return res.status(404).json({ error: "Model not found. Please check your schema file" });
    }

    const expectedMethod = actionMethodMap[action];

    if (req.method !== expectedMethod) {
        return res.status(405).json({ error: `Method ${req.method} not allowed for action ${action}. Expected ${expectedMethod}.` });
    }

    const controller = createController(schema);

    try {
        const itemId = req.query.id;
        switch (action) {
            case "getAll":
                res.json(await controller.getAllItems(filters, options, populateFields));
                break;
            case "get":
                const item = await controller.getItem(filters, populateFields);
                item ? res.json(item) : res.status(404).json({ error: `${modelName} not found` });
                break;
            case "create":
                res.status(201).json(await controller.createItem(req.body));
                break;
            case "update":
                const updatedItem = await controller.updateItem(itemId as string, req.body);
                updatedItem ? res.json(updatedItem) : res.status(404).json({ error: `${modelName} not found` });
                break;
            case "delete":
                const deletedItem = await controller.deleteItem(itemId as string);
                deletedItem ? res.json(deletedItem) : res.status(404).json({ error: `${modelName} not found` });
                break;
            case "login":
                await login(req, res);
                break;
            default:
                res.status(404).json({ error: "Action not found" });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
 
router.use(createRoute); //TODO: Tüm istekler bu route üzerinden geçecek. Ve daha authMiddleware fonksiyonunu çağıracağız.

export default router;

