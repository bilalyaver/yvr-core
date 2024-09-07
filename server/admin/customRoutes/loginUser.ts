import { Request, Response, NextFunction } from 'express';
import loadSchema from '../../loadSchema';
import { loadModel } from '../../loadModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConfig } from '../../../config';
import mongoose from 'mongoose';

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: mongoose.Schema.Types.ObjectId
    [key: string]: any;
}

async function loginUser(req: Request, res: Response, next: NextFunction) {
    const schema = loadSchema('User');
    if (!schema) {
        return res.status(404).json({ error: 'User schema not found' });
    }

    const userModel = loadModel(schema);

    const { email, password } = req.body;

    const user = await userModel.findOne<IUser>({ email })
        .select('password');


    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const { jwtSecret } = getConfig()

    // JWT token oluştur
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            name: user.name
        },
        jwtSecret || 'your_jwt_secret',
        { expiresIn: '1d' }
    );

    res.json({ token, user: { name: user.name, email: user.email } });



}

export default loginUser;