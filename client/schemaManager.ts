import axios from 'axios';
import { getConfig } from '../config';
import { logout } from './logout';
import { getCookie } from 'cookies-next';

let { apiKey } = getConfig();



// Add a request interceptor
const headers = () => {
    const token = getCookie('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-internal-request': 'true',
            'x-api-key': apiKey
        }
    };
}


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
            const { data } = await axios.get(`/schemaManager/all:loadAll`, headers());
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
            const result = await axios.post(`/schemaManager/${modelData.name}:create`, schemaDefinition, headers());
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
            const result = await axios.put(`/schemaManager/${modelData.name}:update`, schemaDefinition, headers());
            return result?.data;
        } catch (error: any) {
            return error?.response?.data;
        }
    },
    load: async (collectionName: string) => {
        try {
            const { data } = await axios.get(`/schemaManager/${collectionName}:load`, headers());
            return data;
        } catch (error: any) {
            return error?.response?.data;
        }
    }
};

export default schemaManager;