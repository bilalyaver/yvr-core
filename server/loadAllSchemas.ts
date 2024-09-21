import path from 'path';
import fs from 'fs';
import ConfigError from '../common/ConfigError';


export default function loadAllSchemas(): any {

    

    try {
        const effectivePath = "src/schemas";
        if (!effectivePath) {
            throw new ConfigError("The required environment variable MODELS_PATH is not set. Please make sure that the required environment variables are set correctly in your .env file");
        }

        const absolutePath = path.resolve(effectivePath);

        const schemas = fs.readdirSync(absolutePath)

        if(!schemas) {
            return [];
        }

        return schemas || [];
    } catch (error:any) {
        throw new ConfigError(`Error loading schemas ${error.message}`);
    }
}