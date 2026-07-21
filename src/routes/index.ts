import {Router} from 'express';
import bookRoutes from "./bookRoutes.ts";
import authRoutes from "./authRoutes.ts";

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);

export default router;