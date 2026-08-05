import {createInsertSchema, createSelectSchema, createUpdateSchema} from "drizzle-zod";
import {books, notes, users, usersToBooks} from "../db/schema.ts";

const omittedFields = { id: true, createdAt: true, updatedAt: true } as const;
const omittedFieldsWithUserId = { ...omittedFields, userId: true } as const;

export const insertBookSchema = createInsertSchema(books).omit(omittedFields);
export const selectBookSchema = createSelectSchema(books);
export const updateBookSchema = createUpdateSchema(books).omit(omittedFields);
export const insertNoteSchema = createInsertSchema(notes).omit(omittedFieldsWithUserId);
export const selectNoteSchema = createSelectSchema(notes);
export const updateNoteSchema = createUpdateSchema(notes).omit(omittedFieldsWithUserId);
export const insertUserSchema = createInsertSchema(users).omit(omittedFields).omit({passwordHash: true});
export const selectUserSchema = createSelectSchema(users);
export const updateUserSchema = createUpdateSchema(users).omit(omittedFields);
export const insertUserToBookSchema = createInsertSchema(usersToBooks);
export const selectUserToBookSchema = createSelectSchema(usersToBooks);
export const updateUserToBookSchema = createUpdateSchema(usersToBooks).omit({...omittedFieldsWithUserId, bookId: true});