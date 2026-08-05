import {Request, Response} from "express";
import {RequestWithUser} from "../types/index.ts";
import {db} from "../db/index.ts";
import {books, usersToBooks} from "../db/schema.ts";
import {and, eq, getColumns} from "drizzle-orm";
import {updateUserToBookSchema} from "../schemas/databaseZodSchemas.ts";
import {z} from "zod";

export const addBookToUserLibrary = async (req: Request<object, object, { bookId: number }>, res: Response) => {
    const {user} = req as RequestWithUser;
    const {bookId} = req.body;

    const isBookAlreadyInLibrary = await db.query.usersToBooks.findFirst({
        where: {
            AND: [
                {bookId},
                {userId: user.id}
            ]
        }
    });
    if (isBookAlreadyInLibrary) {
        return res.status(409).send({message: "Book already in library"});
    }

    const newEntry = await db.insert(usersToBooks).values({
            userId: user.id,
            bookId: bookId,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ).returning();

    return res.status(201).json(newEntry);
};

export const getBooksFromUserLibrary = async (req: Request, res: Response) => {
    const {user} = req as RequestWithUser;

    const {author, publishedYear, title, coverUrl} = getColumns(books);

    const selectColumns = {
        author: author,
        publishedYear: publishedYear,
        title: title,
        status: usersToBooks.status,
        bookId: usersToBooks.bookId,
        coverUrl: coverUrl,
        createdAt: usersToBooks.createdAt,
        updatedAt: usersToBooks.updatedAt
    };

    const result = await db.select(selectColumns).from(usersToBooks)
        .where(eq(usersToBooks.userId, user.id)).leftJoin(books, eq(usersToBooks.bookId, books.id));

    return res.status(200).json(result);
};

export const updateLibraryBookData = async (req: Request, res: Response) => {
    const parsed = updateUserToBookSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({message: 'Invalid request body', errors: z.treeifyError(parsed.error)});
        return;
    }

    const {bookId} = req.params;
    const {user} = (req as RequestWithUser);
    const {rating, status} = parsed.data;
    try {
        const updatedData = await db.insert(usersToBooks)
            .values({bookId: Number(bookId), userId: user.id, rating, status})
            .onConflictDoUpdate({
                target: [usersToBooks.bookId, usersToBooks.userId],
                set: {updatedAt: new Date(), rating, status}
            })
            .returning();
        if (updatedData.length === 0) {
            res.status(404).json({message: 'Book not found'});
        } else {
            res.json(updatedData);
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({message: 'Internal server error'});
    }
};

export const removeBookFromUserLibrary = async (req: Request, res: Response) => {
    const {user} = req as RequestWithUser;
    const {bookId} = req.params;

    const deletedBook = await db.delete(usersToBooks).where(
        and(
            eq(usersToBooks.bookId, Number(bookId)),
            eq(usersToBooks.userId, user.id)
        )
    ).returning();

    if (deletedBook.length === 0) {
        return res.status(404).json({message: "Book not found in library"});
    }

    return res.status(200).json({message: "Book removed from library"});
};