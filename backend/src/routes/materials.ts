import { Router } from 'express';
import { uploadMaterial, getMaterials } from '../controllers/materialControllers';

const router = Router();

router.post('/', uploadMaterial);
router.get('/', getMaterials);

export default router;