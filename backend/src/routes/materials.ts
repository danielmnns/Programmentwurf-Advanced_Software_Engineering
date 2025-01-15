import { Router } from 'express';
import {
  getMaterials,
  uploadMaterial,
} from '../controllers/materialControllers';

const router = Router();

router.post('/', uploadMaterial);
router.get('/', getMaterials);

export default router;
