import fs from 'fs';
import path from 'path';
import { getConfig } from '../config';
import ConfigError from '../common/ConfigError';

type Models = {
  [key: string]: any;
};

export default function loadModels(modelsPath?: string): Models {
  const config = getConfig();
  const effectivePath = modelsPath || process.env.MODELS_PATH || config.modelsPath;
  if (!effectivePath) {
    throw new ConfigError("The required environment variable MODELS_PATH is not. Please make sure that the required environment variables are set correctly in your .env file")
  }

  const absolutePath = path.resolve(effectivePath);
  const models: Models = {};

  fs.readdirSync(absolutePath).forEach((file: string) => {
    const name = file.split('.')[0];
    const model = require(path.join(absolutePath, file));
    models[name] = model;
  });

  return models;
}