import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig } from '../config';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const config = getConfig();
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

    const allowedPaths = ['/user:login', '/user:create', '/user:getAll'];
    if (allowedPaths.includes(req.path)) {
        return next();
    }

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret || 'your_jwt_secret');
        (req as any).user = decoded; // Kullanıcı bilgilerini isteğe ekle
        next(); // Bir sonraki middleware veya route handler'a geç
    } catch (ex) {
        res.status(401).json({ error: 'Invalid token.' });
    }
}