import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getConfig } from '../../../config';

const adminCors = (req: Request, res: Response, next: NextFunction) => {
    const { publicUrl } = getConfig();
    const reqApiKey = req.headers['x-api-key'];
    if (!publicUrl) {
        return res.status(500).json({ message: 'CORS misconfiguration: publicUrl is not set in environment variables' });
    }

    cors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin || origin === publicUrl) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        optionsSuccessStatus: 200
    })(req, res, next);
};

export default adminCors;