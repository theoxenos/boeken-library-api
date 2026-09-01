import {Router} from "express";
import {login, me, register} from "../controllers/authController.ts";
import {authMiddleware, tokenExtractorMiddleware} from "../middleware/authMiddleware.ts";

const router = Router();

router.post('/login', login);
router.get('/me', tokenExtractorMiddleware, authMiddleware, me);
router.post('/register', register);

export default router;