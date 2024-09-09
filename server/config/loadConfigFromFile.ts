import fs from 'fs';
import path from 'path';

// Config dosyasını yükle
export function loadConfigFromFile(): any {
  // Projenin çalışma dizinine (root) göre config dosyasının yolunu belirler
  const configPath = path.join(process.cwd(), 'settings.json');  // Root'ta config.json dosyasını arar

  try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configData);  // JSON formatında config dosyasını yükler
  } catch (error) {
    return {};  // Hata durumunda boş bir nesne döndürür
  }
}