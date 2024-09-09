import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import settings from './settingLoader';  // settings.json dosyasını import ediyoruz
import adminCors from './middleware/admin/adminCors';

const router = Router();

// Dinamik olarak custom route'ları yükleyen fonksiyon
const loadCustomRoutes = (): void => {
    const customRoutesDir = path.join(process.cwd(), 'src', 'custom', 'routes');
    const customFiles = fs.readdirSync(customRoutesDir);

    if (customFiles.length === 0) {
        router.use((req: Request, res: Response) => {
            res.json({ message: 'No custom routes found, this is the default route.' });
        });
        return;
    }

    // Tüm dosyaları oku ve route'ları yükle
    customFiles.forEach((file: string) => {
        const routeModule = require(path.join(customRoutesDir, file));
        const route = routeModule.default || routeModule;

        if (!route || typeof route !== 'function') {
            return;
        }

        // Dosya adındaki "Route" kısmını çıkar ve ana route ismini al
        const baseRouteName = file.replace('Route', '').replace('.ts', '').replace('.js', '');

        // Route ayarlarını settings.json'dan çek
        const routeSettings = settings().routes[baseRouteName];

        if (!routeSettings?.enabled) {
            // Eğer route devre dışı bırakılmışsa, bu mesajı döndür
            router.use(`/${baseRouteName}`, (req: Request, res: Response) => {
                res.status(403).json({ message: `API for ${baseRouteName} is disabled.` });
            });
            return;
        }

        if (routeSettings?.corsEnabled) {
            router.use(`/${baseRouteName}`, (req: Request, res: Response, next) => {
                res.status(200).json({ message: `CORS is enabled for ${baseRouteName}.` });
            });
        }

        if (routeSettings?.authRequired) {
            // Eğer auth gerekli ise auth middleware ekle
            router.use(`/${baseRouteName}`, (req: Request, res: Response, next) => {
                res.status(401).json({ message: `API for ${baseRouteName} requires authentication.` });
            });
        }

        

        // Dinamik route'u ekle
        router.use(`/${baseRouteName}`, route);
    });
};

// Dinamik route'ları yükleyelim
loadCustomRoutes();

export default router;