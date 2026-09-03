import {LibSQLDatabase} from "drizzle-orm/libsql";
import * as schema from "../src/db/schema.ts";
import {booksForTesting} from "./booksTestHelper.ts";
import {multipleUsersForTesting, hashPassword, generateTokenForUser} from "./usersTestHelper.ts";
import {notesForTesting} from "./notesTestHelper.ts";
import {relations} from "../src/db/relations.ts";

export const resetDatabase = async (db: LibSQLDatabase<any>) => {
    // Delete in order to satisfy foreign key constraints
    await db.delete(schema.notes);
    await db.delete(schema.usersToBooks);
    await db.delete(schema.books);
    await db.delete(schema.users);
};

export const seedUsers = async (db: LibSQLDatabase<any>) => {
    const hashedUsers = await Promise.all(
        multipleUsersForTesting.map(async (user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            passwordHash: await hashPassword(user.password),
        }))
    );
    return await db.insert(schema.users).values(hashedUsers).returning();
};

export const seedBooks = async (db: LibSQLDatabase<any>) => {
    return await db.insert(schema.books).values(booksForTesting).returning();
};

export const seedNotes = async (db: LibSQLDatabase<any>) => {
    return await db.insert(schema.notes).values(notesForTesting).returning();
};

/**
 * Completely resets the database and seeds it with requested test data.
 */
export const initializeTestData = async (db: LibSQLDatabase<any>, options: {
    users?: boolean,
    books?: boolean,
    notes?: boolean
} = {users: true, books: true, notes: false}) => {
    await resetDatabase(db);

    let seededUsers: any[] = [];
    if (options.users) {
        seededUsers = await seedUsers(db);
    }

    let seededBooks: any[] = [];
    if (options.books) {
        seededBooks = await seedBooks(db);
    }

    let seededNotes: any[] = [];
    if (options.notes && options.users && options.books) {
        seededNotes = await seedNotes(db);
    }

    // Default token for the first user
    let token = "";
    if (seededUsers.length > 0) {
        token = await generateTokenForUser(seededUsers[0].id);
    }

    return {seededUsers, seededBooks, seededNotes, token};
};

/**
 * Returns an auth token for a specific user email.
 * Assumes the user is already seeded.
 */
export const getAuthTokenForEmail = async (db: LibSQLDatabase<typeof schema, typeof relations>, email: string) => {
    const user = await db.query.users.findFirst({
        where: {email}
    });
    if (!user) throw new Error(`User with email ${email} not found`);
    return await generateTokenForUser(user.id);
};
