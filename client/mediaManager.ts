import { getConfig } from "../config";
import api from "./api";

export interface UploadOptions {
    onProgress?: (percentage: number, file: File) => void; // Yükleme ilerlemesini güncellemek için callback
    onSuccess?: (response: any, file: File) => void; // Yükleme başarılı olduğunda çalıştırılacak callback
    onError?: (error: any, file: File) => void; // Yükleme başarısız olduğunda çalıştırılacak callback
    folder?: string; // Dosyaların yükleneceği klasör
    user?: string; // Kullanıcı kimliği
}

export const uploadFiles = (files: File[], options: UploadOptions) => {
    const { onProgress, onSuccess, onError, folder, user } = options;

    const publicPath = getConfig().publicPath || '';

    files.forEach((file) => {
        const formData = new FormData();
        formData.append('file', file);
        user && formData.append('user', user);
        folder && formData.append('folder', folder);

        const xhr = new XMLHttpRequest();

        xhr.open('POST', `${publicPath}/media/upload`, true);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                onProgress(percentComplete, file);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (onSuccess) {
                    onSuccess(response, file);
                }
            } else {
                if (onError) {
                    onError(new Error(`Failed to upload file: ${xhr.statusText}`), file);
                }
            }
        };

        xhr.onerror = () => {
            if (onError) {
                onError(new Error('Upload failed.'), file);
            }
        };

        xhr.send(formData);
    });
};

export const deleteFile = async (fileId: string) => {
    const publicPath = getConfig().publicPath || '';

    const response = await fetch(`${publicPath}/media/delete?id=${fileId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Failed to delete file.');
    }
}



export const deleteFolder = async (folderId: string) => {
    try {


        

       console.log('Deleting folder:', folderId);

       

        const foundFolders = await api.get(`/folder:getAll?filter.parent=${folderId}`);

        for (const folder of (foundFolders as any).list) {
            console.log('Deleting folder:', folder._id);
        }


        // const fileSchema = schemaManager.load('File');
        // if (!fileSchema) {
        //     throw new Error('File schema not found.');
        // }

        // const fileController = createController(fileSchema as any);

        // const files = await fileController.getAllItems({ folder: folderId });

        // files.list.forEach(async (file: any) => {
        //     await deleteFile(file._id);
        // });


    } catch (error) {
        console.error('Error deleting folder:', error);
        throw new Error('Failed to delete folder.');
    }
}


const mediaManager = {
    uploadFiles,
    deleteFile,
    deleteFolder
};

export default mediaManager;