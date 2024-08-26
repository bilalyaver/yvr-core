import axios from 'axios';
import { getConfig } from '../config';
import ConfigError from '../common/ConfigError';
import { logout } from './logout';

let { apiUrl, apiKey } = getConfig();

if (!apiUrl) {
    throw new ConfigError("The required environment variable API_URL is not. Please make sure that the required environment variables are set correctly in your next.config file")
}

// Add a request interceptor
const headers = () => {

    return {
        headers: {
            'x-api-key': apiKey
        }
    };
}

apiUrl = apiUrl.replace('/api', '');
apiUrl = `${apiUrl}/schemaManager`;

export interface FieldDefinition {
    name: string;
    type: string;
    required: boolean;
    unique: boolean;
    displayName: string;
    description: string;
}

const schemaManager = {
    loadAll: async () => {
        try {
            const { data } = await axios.get(`${apiUrl}/all:loadAll`, headers());
            return data;
        } catch (error: any) {
            const statusCode = error?.response?.status;
            if (statusCode === 401) {
                logout();
            }
            return error?.response?.data;
        }
    },
    create: async (modelData: { name: string; description: string; displayName: string }, fields: FieldDefinition[]) => {
        const schemaDefinition = {
            model: {
                name: modelData.name,
                description: modelData.description,
                displayName: modelData.displayName,
            },
            fields: fields,
        };

        try {
            const result = await axios.post(`${apiUrl}/${modelData.name}:create`, schemaDefinition, headers());
            return result?.data;
        } catch (error: any) {
            return error?.response?.data;
        }
    },

    update: async (modelData: { name: string; description: string; displayName: string }, fields: FieldDefinition[]) => {
        const schemaDefinition = {
            model: {
                name: modelData.name,
                description: modelData.description,
                displayName: modelData.displayName,
            },
            fields: fields,
        };

        try {
            const result = await axios.put(`${apiUrl}/${modelData.name}:update`, schemaDefinition, headers());
            return result?.data;
        } catch (error: any) {
            return error?.response?.data;
        }
    },
    load: async (collectionName: string) => {
        try {
            const { data } = await axios.get(`${apiUrl}/${collectionName}:load`, headers());
            return data;
        } catch (error: any) {
            return error?.response?.data;
        }
    }
};

export default schemaManager;