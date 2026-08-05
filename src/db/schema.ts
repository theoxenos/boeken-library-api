import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";

export const books = sqliteTable('books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  publishedYear: integer('published_year'),
  isbn10: text('isbn10'),
  isbn13: text('isbn13'),
  coverUrl: text('cover_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').references(() => books.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const usersToBooks = sqliteTable('users_to_books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  bookId: integer('book_id').references(() => books.id).notNull(),
  rating: real('rating').default(0).notNull(),
  status: text('status', {enum: ['reading', 'to-read', 'completed']}).notNull().default('to-read'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex('users_to_books_user_id_book_id_unique').on(table.userId, table.bookId)
]);


export type BookInsertModel = InferInsertModel<typeof books>;
export type UserSelectModel = InferSelectModel<typeof users>;

// export const parentTable = sqliteTable('test_table', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   name: text('name').notNull(),
// });
//
// export const childTable = sqliteTable('test_advanced_table', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   parentId: integer('test_table_id').references(() => parentTable.id).notNull(),
//   name: text('name').notNull(),
// });
