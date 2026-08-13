import type {Request, Response} from 'express';
import {db} from '../db/index.ts';
import {and, asc, desc, eq, getColumns, like, or, sql, SQL, type AnyColumn} from "drizzle-orm";
import {z} from 'zod';
import {books, users, usersToBooks} from "../db/schema.ts";
import {insertBookSchema, updateBookSchema} from "../schemas/databaseZodSchemas.ts";
import {findBookByIsbn} from "../services/openLibraryService.ts";
import {RequestWithUser} from "../types/index.ts";

type BaseParams = Record<string, string>;

interface IsbnParams extends BaseParams {
    isbn: string;
}

interface IdParams extends BaseParams {
    id: string;
}

type GetBooksParams = BaseParams & {
    title?: string;
    isbn?: string;
    author?: string;
    sortBy?: string;
    sortOrder?: string;
}

const getSortOrder = (sortBy?: string, sortOrder?: string) => {
    if (!sortBy || !sortOrder) {
        return asc(books.title);
    }

    if (sortBy === 'averageRating') {
        const column = sql`average_rating`;
        return sortOrder === 'asc' ? asc(sql`average_rating`) : desc(column);
    }

    const cols: Record<string, AnyColumn> = getColumns(books);
    const column = cols[sortBy];
    return sortOrder === 'asc' ? asc(column) : desc(column);
}

export const getBooks = async (req: Request<object, object, object, GetBooksParams>, res: Response) => {
    try {
        const {user} = req as RequestWithUser;
        const {title, isbn, author, sortBy, sortOrder} = req.query;

        const filterConditions: SQL[] = [];
        if (title) {
            filterConditions.push(like(books.title, `%${title}%`));
        }
        if (author) {
            filterConditions.push(like(books.author, `%${author}%`));
        }
        if (isbn) {
            filterConditions.push(or(eq(books.isbn10, isbn), eq(books.isbn13, isbn))!);
        }

        const avgSubquery = db
            .select({
                bookId: usersToBooks.bookId,
                averageRating: sql<number>`avg(
                    ${usersToBooks.rating}
                )`.as('average_rating'),
            })
            .from(usersToBooks)
            .groupBy(usersToBooks.bookId)
            .as('avg_ratings');

        const allBooks = await db
            .select({
                ...getColumns(books),
                userRating: usersToBooks.rating,
                status: usersToBooks.status,
                // Overall average rating for the book from all users
                averageRating: sql<number>`${avgSubquery.averageRating}`,
            })
            .from(books)
            // Left join to get the specific user's interaction/rating with the book
            .leftJoin(
                usersToBooks,
                and(eq(usersToBooks.bookId, books.id), eq(usersToBooks.userId, user.id))
            )
            // Left join the aggregation subquery to get the global average rating
            .leftJoin(avgSubquery, eq(avgSubquery.bookId, books.id))
            .where(and(...filterConditions))
            .orderBy(getSortOrder(sortBy, sortOrder));

        res.json(allBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({message: 'Error fetching books'});
    }
};

export const getBookById = async (req: Request, res: Response) => {
    try {
        const {user} = req as RequestWithUser;

        const avgSubquery = db
            .select({
                bookId: usersToBooks.bookId,
                averageRating: sql<number>`avg(
                ${usersToBooks.rating}
                )`.as('average_rating'),
            })
            .from(usersToBooks)
            .groupBy(usersToBooks.bookId)
            .as('avg_ratings');

        const book = await db.select({
            ...getColumns(books),
            rating: usersToBooks.rating,
            status: usersToBooks.status,
            averageRating: avgSubquery.averageRating
        })
            .from(books)
            .leftJoin(usersToBooks, and(eq(usersToBooks.bookId, books.id), eq(usersToBooks.userId, user.id)))
            .leftJoin(avgSubquery, eq(avgSubquery.bookId, books.id))
            .where(eq(books.id, Number(req.params.id)));

        if (book.length === 0) {
            return res.status(404).json({message: 'Book not found'});
        }

        return res.json(book[0]);
    } catch (error) {
        console.error('Error fetching book:', error);
        return res.status(500).json({message: 'Error fetching book'});
    }
};

export const getBookByIsbn = async (req: Request<IsbnParams>, res: Response) => {
    const isbn = req.params.isbn;
    if (!isbn) {
        res.status(400).json({message: 'ISBN is required'});
        return;
    }

    const bookFromDatabase = await db.query.books.findFirst({
        where: {
            OR: [
                {isbn10: isbn},
                {isbn13: isbn},
            ]
        }
    });

    if (bookFromDatabase) {
        res.json(bookFromDatabase);
        return;
    }

    try {
        const bookFromOpenLibraryApi = await findBookByIsbn(isbn);
        res.json(bookFromOpenLibraryApi);
    } catch (error) {
        console.error('Error fetching book from Open Library API:', error);
        res.status(500).json({message: 'Error fetching book from Open Library API'});
        return;
    }
};

export const createBook = async (req: Request, res: Response) => {
    const parsed = insertBookSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({message: 'Invalid input', errors: z.treeifyError(parsed.error)});
        return;
    }
    try {
        const [newBook] = await db.insert(books).values(parsed.data).returning();
        res.status(201).json(newBook);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(400).json({message: 'Error creating book'});
    }
};

export const updateBook = async (req: Request, res: Response) => {
    const parsed = updateBookSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({message: 'Invalid input', errors: z.treeifyError(parsed.error)});
        return;
    }

    try {
        const updatedBook = await db.update(books)
            .set({...parsed.data, updatedAt: new Date()})
            .where(eq(books.id, Number(req.params.id)))
            .returning();
        if (updatedBook.length === 0) {
            res.status(404).json({message: 'Book not found'});
        } else {
            res.json(updatedBook);
        }
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(400).json({message: 'Error updating book'});
    }
};

export const deleteBook = async (req: Request, res: Response) => {
    try {
        const deleted = await db.delete(books)
            .where(eq(books.id, Number(req.params.id)))
            .returning();
        if (deleted.length === 0) {
            res.status(404).json({message: 'Book not found'});
        } else {
            res.status(204).send();
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(400).json({message: 'Error deleting book'});
    }
};

export const getAllNotesForBook = async (req: Request, res: Response) => {
    const {user} = (req as RequestWithUser);
    const {id} = (req as Request<IdParams>).params;

    const notes = await db.query.notes.findMany({
        where: {
            AND: [
                {userId: user.id},
                {bookId: Number(id)}
            ]
        },
        orderBy: {createdAt: 'desc', title: 'asc'},
        // with: {
        //     book: true
        // }
    });
    res.json(notes);
};