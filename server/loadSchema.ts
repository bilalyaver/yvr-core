import path from 'path';
import ConfigError from '../common/ConfigError';
import User from './schemas/User.json';
import Media from './schemas/Media.json';
import Folder from './schemas/Folder.json';



export default function loadSchema(schemaName: string): any {
    const localSchemas = ['User', 'Media', 'Folder'];

    if(localSchemas.includes(schemaName)) {
        switch(schemaName) {
            case 'User':
                return User;
            case 'Media':
                return Media;
            case 'Folder':
                return Folder;
            default:
                return null;
        }
    }

    try {
        const effectivePath = "src/schemas";
        if (!effectivePath) {
            throw new ConfigError("The required environment variable MODELS_PATH is not set. Please make sure that the required environment variables are set correctly in your .env file");
        }

        const absolutePath = path.resolve(effectivePath);

        const schema = require(path.join(absolutePath, `${schemaName}.json`));

        if(!schema) {
            throw new ConfigError(`Schema not found: ${schemaName}`);
        }

        return schema || null;
    } catch (error) {
        throw new ConfigError(`Error loading schema: ${schemaName}`);
    }
}