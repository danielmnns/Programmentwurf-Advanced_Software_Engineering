import express from 'express';
import { assignRole } from '../controllers/adminController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/assign-role', authenticateToken, authorize('Admin'), (req, res, next) => {
    assignRole(req, res).then(result => {
        if (result) {
            res.json(result);
        }
    }).catch(next);
});

export default router;