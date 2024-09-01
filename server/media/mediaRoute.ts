import { Router } from 'express';
import { uploadFile, deleteFile } from './mediaController';

const router = Router();

router.post('/upload', uploadFile);
router.delete('/delete', deleteFile);


// Diğer medya route'ları buraya gelecek...

export default router;