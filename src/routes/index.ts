import {Router} from 'express';
import bookRoutes from "./bookRoutes.ts";
import noteRoutes from "./noteRoutes.ts";

const router = Router();

router.use('/books', bookRoutes);
router.use('/notes', noteRoutes);

export default router;