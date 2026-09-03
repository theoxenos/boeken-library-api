import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { relations } from "./relations.ts";
import * as schema from "./schema.ts";

export const createTestDb = async () => {
    const db = drizzle(":memory:", { relations, schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
    return db;
};
