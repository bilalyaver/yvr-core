import { Router } from 'express';
import { uploadFile, deleteMedia, deleteFile } from './mediaController';

const router = Router();

router.post('/upload', uploadFile);
router.delete('/delete', deleteMedia);
router.delete('/deleteFile', deleteFile)


// Diğer medya route'ları buraya gelecek...

export default router;