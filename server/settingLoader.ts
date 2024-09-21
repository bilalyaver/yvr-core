
import { getConfig } from '../config';
import { loadConfigFromFile } from './config/loadConfigFromFile';

export default function settingLoader(): any {
  // Çevresel değişkenleri ve config dosyasını birleştir
  const config = getConfig();  // Çevresel değişkenler
  const fileConfig = loadConfigFromFile();  // Config dosyasından gelen ayarlar

  return {
    ...fileConfig,  // Config dosyasından gelen ayarlar
    ...config,  // Çevresel değişkenlerden gelen ayarlar
  };
}

