import { Router } from 'express';
import { uploadFile, deleteMedia, deleteFile } from './mediaController';
import { schemaAccessControl } from '../middleware/schemaAccessControl';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(schemaAccessControl, authMiddleware);

router.post('/upload', uploadFile);
router.delete('/delete', deleteMedia);
router.delete('/deleteFile', deleteFile)


// Diğer medya route'ları buraya gelecek...

export default router;