import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import adminRoute from './admin/adminRoute';
import createRoute from './public/createRoute';
import schemaManager from './schemaManager';
import mediaRoute from './media/mediaRoute';
import customRoute from './customRoute';

// Çevresel değişkenleri yükle
dotenv.config();

interface InitializeServerOptions { 
  devMode?: boolean;
}

// Express sunucusunu döndür
export const initializeServer = async ({ devMode = false }: InitializeServerOptions) => {
  const server = express();

  // Statik dosya servisi
  server.use(express.static(path.join(process.cwd(), 'public')));
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json({ limit: '50mb' }));

  // CORS middleware
  server.use(cors());

  // yvr-core route'larını ekle
  server.use('/admin/api', adminRoute);
  server.use('/custom', customRoute);  // Custom route'lar
  server.use('/api', createRoute);
  server.use('/schemaManager', schemaManager);
  server.use('/media', mediaRoute);

  // Express uygulamasını döndür (listen işlemi burada yapılmıyor)
  return server;
};