import path from 'path';
import ConfigError from '../common/ConfigError';



export default function loadSchema(schemaName: string): any {
    const localSchemas = ['User', 'Role', 'Permission', 'Media', 'Folder'];

    if(localSchemas.includes(schemaName)) {
        return require(`./schemas/${schemaName}.json`);
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