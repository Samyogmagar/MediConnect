import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import settingsController from '../controllers/settings.controller.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware([ROLES.ADMIN]));

// GET/PUT hospital settings
router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

export default router;
