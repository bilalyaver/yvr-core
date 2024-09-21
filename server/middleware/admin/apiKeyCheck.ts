import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../../../config';

const apiKeyCheck = (req: Request, res: Response, next: NextFunction) => {
    const { apiKey } = getConfig();
    const reqApiKey = req.headers['x-api-key'];
    const excludedPaths = ['/firstUserCheck', '/login', '/createFirstUser'];

    if (excludedPaths.includes(req.path)) {
        return next();
    }

    if (!apiKey) {
        return res.status(500).json({ message: 'API key is not set in environment variables' });
    }

    if (reqApiKey != apiKey) {
        return res.status(401).json({ message: 'Invalid API key' });
    }
    next();
};

export default apiKeyCheck;