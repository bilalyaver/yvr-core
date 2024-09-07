import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig } from '../../../config';
import ConfigError from '../../../common/ConfigError';

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

    const { jwtSecret } = getConfig();
    console.log("jwtSecret", jwtSecret);

    if (!jwtSecret) {
        throw new ConfigError("The required environment variable JWT_SECRET is not set. Please make sure that the required environment variables are set correctly in your .env file");
    }

    console.log("token", token);

    const allowedPaths = ['/user:login', '/user:create', '/user:getAll'];
    if (allowedPaths.includes(req.path)) {
        return next();
    }

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret || 'your_jwt_secret');
        (req as any).user = decoded; // Kullanıcı bilgilerini isteğe ekle
        next(); // Bir sonraki middleware veya route handler'a geç
    } catch (ex) {
        res.status(401).json({ error: 'Invalid token.' });
    }
}