// Gerekli modülleri içe aktarın
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import next from 'next';
import adminRoute from './admin/adminRoute';
import createRoute from './public/createRoute';
import schemaManager from './schemaManager';
import mediaRoute from './media/mediaRoute';
import customRoute from './customRoute';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';
import settingLoader from './settingLoader';

// Çevresel değişkenleri yükle
dotenv.config();

// Sunucuyu başlatan fonksiyon
export const initializeServer = async () => {
  const dev = process.env.NODE_ENV !== 'production';
  const app = next({ dev, dir: path.join(process.cwd(), 'client') });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = express();
  const { swagger, port } = settingLoader();

  // Statik dosya servisi
  server.use(express.static(path.join(process.cwd(), 'public')));
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json({ limit: '50mb' }));

  // CORS middleware
  server.use(cors());

  console.log(`🚀 Admin panel ready at http://localhost:${port}`);

  // Swagger UI
  if (swagger?.enabled) {
    server.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`🚀 Swagger ready at http://localhost:${port}/docs`);
  }

  // yvr-core route'larını ekle
  server.use('/admin/api', adminRoute);
  server.use('/custom', customRoute);
  server.use('/api', createRoute);
  server.use('/schemaManager', schemaManager);
  server.use('/media', mediaRoute);

  // Tüm istekleri Next.js tarafından ele alınacak şekilde yönlendir
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Sunucuyu belirtilen portta dinlemeye başla
  server.listen(port);

  return server;
};