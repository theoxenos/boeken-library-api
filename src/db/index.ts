import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.ts';
import { relations } from './relations.ts';

const sqlite = new Database('sqlite.db');
export const db = drizzle({ client: sqlite, schema, relations, logger: true });
