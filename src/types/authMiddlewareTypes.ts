import {Request} from "express";
import {UserSelectModel} from "../db/schema.ts";

export interface RequestWithToken extends Request {
    token?: string;
}

export interface RequestWithUser extends Request {
    user: UserSelectModel
}