import path from 'path';
import ConfigError from '../common/ConfigError';



export default function loadSchema(schemaName: string): any {
    try {
        const effectivePath = "src/schemas";
    if (!effectivePath) {
        throw new ConfigError("The required environment variable MODELS_PATH is not. Please make sure that the required environment variables are set correctly in your .env file")
    }

    const absolutePath = path.resolve(effectivePath);

    const schema = require(path.join(absolutePath, schemaName));

    if(!schema) {
        throw new ConfigError(`Schema not found: ${schemaName}`);
    }

    return schema || null;
    } catch (error) {
        return null;
    }
}