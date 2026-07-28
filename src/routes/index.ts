import {Router} from 'express';
import bookRoutes from "./bookRoutes.ts";
import noteRoutes from "./noteRoutes.ts";
import libraryRoutes from "./libraryRoutes.ts";

const router = Router();

router.use('/books', bookRoutes);
router.use('/library', libraryRoutes);
router.use('/notes', noteRoutes);

export default router;