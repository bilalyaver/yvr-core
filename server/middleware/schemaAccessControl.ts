import { Request, Response, NextFunction } from 'express';

// Korunacak şemalar
const protectedSchemas = ['User', 'Folder', 'Media'];

// İsteğin arayüzden mi yoksa dışarıdan mı geldiğini kontrol eden middleware
export function schemaAccessControl(req: Request, res: Response, next: NextFunction) {
    const isInternalRequest = req.headers['x-internal-request']
    console.log('Internal request:', isInternalRequest);
    let [modelName] = req.path.split(':');

    modelName = modelName.slice(1); // modelName başındaki / karakterini kaldır
    modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1); // modelName'i baş harfi büyük yap

    // Eğer korumalı şemalardan biriyle ilgili bir istekse
    if (protectedSchemas.includes(modelName)) {
        // İsteğin nereden geldiğini belirleyelim (header veya başka bir yöntem ile)

        // 1. Yöntem: Özel bir header kontrolü (örneğin: x-internal-request)
        

        // 2. Yöntem: İsteğin IP adresine göre kontrol (isteğin IP'si güvenilir mi?)
        const allowedIps = ['127.0.0.1', '::1'];  // Güvenilir IP adresleri (localhost gibi)
        const requestIp = req.ip || '';  // İsteğin IP adresini al

        // Eğer istek arayüzden gelmiyorsa ve güvenilir bir kaynaktan değilse
        if (!isInternalRequest || !allowedIps.includes(requestIp)) {
            return res.status(403).json({ error: 'Access to this resource is forbidden.' });
        }
    }

    // Eğer her şey uygunsa bir sonraki middleware'e geç
    next();
}
