import {NextFunction, Request, Response} from 'express';

import jwt, {JwtPayload} from "jsonwebtoken";
import {jwtSecret} from "../config/index.ts";
import {db} from "../db/index.ts";
import {RequestWithToken, RequestWithUser} from "../types/index.ts";

export const tokenExtractorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({error: 'No token provided'});
        return;
    }
    (req as RequestWithToken).token = token;
    next();
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = (req as RequestWithToken).token;
    if (!token) {
        res.status(401).json({error: 'No token provided'});
        return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const user = await db.query.users.findFirst({where: {id: Number(decoded.userId)}});
    if (!user) {
        res.status(401).json({error: 'Invalid token'});
        return;
    }
    (req as RequestWithUser).user = user;
    next();
};