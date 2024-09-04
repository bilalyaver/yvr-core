import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import createController from './createController';
import loadSchema from './loadSchema';
import { Document } from 'mongoose';
import { getConfig } from '../config';

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    [key: string]: any;
    

}

const userSchema = loadSchema('User');
const userController = createController<IUser>(userSchema);

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
        // Kullanıcıyı e-posta adresi ile bul
        const user = await userController.getAllItems({ email });
        if (!user || user?.list?.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Şifreyi doğrulamak için password alanını seç
        const userWithPassword = await userController.getAllItems({ email }, { select: 'password' });
        const isMatch = await bcrypt.compare(password, userWithPassword?.list[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const config = getConfig();

        const jwtSecret = config.jwtSecret;

        const foundUser = user.list[0];

        // JWT token oluştur
        const token = jwt.sign(
            { 
                id: foundUser._id,
                email: foundUser.email,
                name: foundUser.name
            },
            jwtSecret || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.json({ token, user: { name: foundUser.name, email: foundUser.email } });
    } catch (err:any) {
        res.status(500).json({ error: err.message });
    }
}