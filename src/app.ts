import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import router from './routes/index.ts';
import {authMiddleware, tokenExtractorMiddleware} from "./middleware/authMiddleware.ts";
import authRoutes from "./routes/authRoutes.ts";

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/', tokenExtractorMiddleware, authMiddleware, router);

export default app;