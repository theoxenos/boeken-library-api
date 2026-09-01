import * as argon2 from "argon2";
import type {Request, Response} from 'express';
import jwt from "jsonwebtoken";

import {z} from "zod";
import {db} from "../db/index.ts";
import {hashSecret, jwtSecret} from "../config/index.ts";
import {users} from "../db/schema.ts";
import {RequestWithUser} from "../types/index.ts";

const userLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

const userRegisterSchema = userLoginSchema.extend({
    name: z.string().min(1),
});

export const login = async (req: Request, res: Response) => {
    const parsedResult = userLoginSchema.safeParse(req.body);
    if (!parsedResult.success) {
        res.status(400).json({error: parsedResult.error});
        return;
    }

    const {email, password} = parsedResult.data;

    const user = await db.query.users.findFirst({
        where: {
            email: {eq: email}
        }
    });
    if (!user) {
        res.status(401).json({error: 'Invalid credentials'});
        return;
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password, {secret: Buffer.from(hashSecret)});
    if (!isPasswordValid) {
        res.status(401).json({error: 'Invalid credentials'});
        return;
    }

    const userForToken = {userId: user.id, email: user.email};
    const token = jwt.sign(userForToken, jwtSecret);
    res.json({token, email: user.email, name: user.name});
};

export const register = async (req: Request, res: Response) => {
    const parsedResult = userRegisterSchema.safeParse(req.body);
    if (!parsedResult.success) {
        res.status(400).json({error: parsedResult.error});
        return;
    }

    const {email, password, name} = parsedResult.data;
    const userExists = await db.query.users.findFirst({
        where: {
            email: {eq: email}
        }
    });
    if (userExists) {
        res.status(400).json({error: 'User already exists'});
        return;
    }
    const passwordHash = await argon2.hash(password, {secret: Buffer.from(hashSecret)});
    await db.insert(users).values({email, passwordHash, name});
    res.status(204).end();
};

export const me = (req: Request, res: Response) => {
    const {user} = req as RequestWithUser;
    res.json({email: user.email, name: user.name});
};