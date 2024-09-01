import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import loadSchema from '../loadSchema';
import createController from '../createController';
import { Document } from 'mongoose';

// Dosya yükleme yapılandırması
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Projenin kök dizinini belirleme
        const projectRoot = path.dirname(require.main?.filename || process.cwd());

        // Dosyaların yükleneceği yolu belirleme (src/public/uploads/)
        const uploadPath = path.join(projectRoot, 'public', 'images');

        // Yükleme işlemi için yolu ayarlama
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Dosya yükleme işlemi
export const uploadFile = async (req: Request, res: Response) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Media upload failed.' });
        }


        const file = req.file;

        const fileSchema = loadSchema('Media');
        if (!fileSchema) {
            return res.status(404).json({ error: 'Media schema not found.' });
        }

        const fileController = createController(fileSchema);
        
        fileController.createItem({
            name: file?.filename,
            type: file?.mimetype,
            size: file?.size,
            folder: req.body.folder,
            user: "66cb7ac3b6733b3bd5386564",
            url: `/images/${file?.filename || ''}`
        } as Partial<Document<unknown, any, any>>);

        console.log('Media uploaded successfully.', file);


        return res.status(200).json({ message: 'Media uploaded successfully.', file });
    });
};

export const deleteFile = async (req: Request, res: Response) => {
    try {
        // Media schema'sını yükleme
        const fileSchema = loadSchema('Media');
        if (!fileSchema) {
            return res.status(404).json({ error: 'Media schema not found.' });
        }

        const fileController = createController(fileSchema);
        const fileId = req.query.id;

        // Veritabanından dosyayı bulma
        const fileItem = await fileController.getItem(fileId as string);

        if (!fileItem) {
            return res.status(404).json({ error: 'Media not found.' });
        }

        // Dosya yolunu belirleme
        const projectRoot = path.dirname(require.main?.filename || process.cwd());
        const filePath = path.join(projectRoot, 'public/images', (fileItem as any).name);

        // Veritabanından dosyayı silme
        await fileController.deleteItem(fileId as string);

        // Dosya sisteminden dosyayı silme
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Failed to delete media:', err);
                return res.status(500).json({ error: 'Failed to delete media.' });
            }

            console.log('Media deleted successfully.');
            return res.status(200).json({ message: 'Media deleted successfully.' });
        });
    } catch (error) {
        console.error('Error deleting media:', error);
        return res.status(500).json({ error: 'An error occurred while deleting the media.' });
    }
};

