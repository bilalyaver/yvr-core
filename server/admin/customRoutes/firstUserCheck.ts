import { Request, Response, NextFunction } from 'express';
import loadSchema from '../../loadSchema';
import adminController from '../adminController';
import { Document } from 'mongoose';
import { loadModel } from '../../loadModel';

async function firstUserCheck(req: Request, res: Response, next: NextFunction) {
    const schema = loadSchema('User');
    if (!schema) {
        return res.status(404).json({ error: 'User schema not found' });
    }

    const userModel = loadModel(schema);
    const adminExists = await userModel.countDocuments();
    return res.status(200).json({ userCount: adminExists });
}

export default firstUserCheck;