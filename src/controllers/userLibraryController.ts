import { Request, Response } from "express";
import { RequestWithUser } from "../types";
import db from "../db";

export const addBook = async (req: Request, res: Response) => {
    const {user} = req as RequestWithUser;
};