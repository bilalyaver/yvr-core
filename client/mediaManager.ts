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

        const image = new Image();
        image.src = URL.createObjectURL(file);

        // Görsel yüklendiğinde boyutları almak için onload olayını kullan
        image.onload = () => {
            let sizes = {
                width: image.width,
                height: image.height
            };

            const dimensions = JSON.stringify(sizes);

            const xhr = new XMLHttpRequest();

            xhr.open('POST', `${publicPath}/media/upload?dimensions=${dimensions}`, true);
    
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
        };

       
    });
};

export const updateFile = async (fileId: string, data: any) => {

    const foundFile = await api.get(`/media:get?filter.id=${fileId}`);

    if (!foundFile) {
        throw new Error('File not found.');
    }
    const publicPath = getConfig().publicPath || '';

    const response = await fetch(`${publicPath}/media/deleteFile?fileName=${foundFile.name}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error('Failed to update file.');
    }

    const formData = new FormData();
    formData.append('file', data.file);
    const xhr = new XMLHttpRequest();

    const dimensions = data.dimensions ? JSON.stringify(data.dimensions) : '';

    xhr.open('POST', `${publicPath}/media/upload?mediaId=${fileId}&dimensions=${dimensions}`, true);

    xhr.onload = () => {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            return response;
        } else {
            throw new Error('Failed to update file.');
        }
    };

    xhr.onerror = () => {
        throw new Error('Failed to update file.');
    };

    xhr.send(formData);

    return true;
}

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
        const foundMedia = await api.get(`/media:getAll?filter.folder=${folderId}`);
        for (const media of (foundMedia as any).list) {
            await deleteFile(media._id);
        }
        const foundFolders = await api.get(`/folder:getAll?filter.parent=${folderId}`);
        await api.delete(`/folder:delete?id=${folderId}`);
        for (const folder of (foundFolders as any).list) {
            await deleteFolder(folder._id);
        }
    } catch (error) {
        throw new Error('Failed to delete folder.');
    }
}

const mediaManager = {
    uploadFiles,
    deleteFile,
    deleteFolder,
    updateFile
};

export default mediaManager;