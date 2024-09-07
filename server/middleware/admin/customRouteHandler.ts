import { Request, Response, NextFunction } from 'express';
import firstUserCheck from '../../admin/customRoutes/firstUserCheck';
import createFirstUser from '../../admin/customRoutes/createFirstUser';
import loginUser from '../../admin/customRoutes/loginUser';


// Her bir path için fonksiyonları tanımlıyoruz
const routeFunctions: Record<string, (req: Request, res: Response, next: NextFunction) => Promise<void>> = {
    '/firstUserCheck': async (req: Request, res: Response, next: NextFunction) => { await firstUserCheck(req, res, next); },
    '/createFirstUser': async (req: Request, res: Response, next: NextFunction) => { await createFirstUser(req, res, next); },
    '/login': async (req: Request, res: Response, next: NextFunction) => { await loginUser(req, res, next); }
};

// Custom route handler middleware
export const customRouteHandler = async (req: Request, res: Response, next: NextFunction) => {
    const routeFunction = routeFunctions[req.path];
    if (routeFunction) {
        // Eğer path için bir fonksiyon tanımlıysa o fonksiyon çalıştırılır
        await routeFunction(req, res, next);
    } else {
        // Path için bir fonksiyon bulunamazsa 404 döner
        next();
    }
};



