import {drizzle} from "drizzle-orm/libsql";
import {relations} from "./relations.ts";

export const db = drizzle(process.env.DATABASE_URL!, {logger: true, relations});
