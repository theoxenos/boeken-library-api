import {drizzle} from "drizzle-orm/libsql";
import {relations} from "./relations.ts";
import {databaseUrl} from "../config/index.ts";

export const db = drizzle(databaseUrl, {logger: true, relations});
