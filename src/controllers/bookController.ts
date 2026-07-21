import type {Request, Response} from 'express';
import {db} from '../db/index.ts';
import {eq, TableFilter} from "drizzle-orm";
import {z} from 'zod';
import {books} from "../db/schema.ts";
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

export const getBooks = async (req: Request, res: Response) => {
    try {
        const {title, isbn, author} = req.query;

        const conditions: TableFilter<typeof books>[] = [];
        if (title && typeof title === 'string') {
            conditions.push({title: {like: `%${title}%`}});
        }
        if (author && typeof author === 'string') {
            conditions.push({author: {like: `%${author}%`}});
        }
        if (isbn && typeof isbn === 'string') {
            conditions.push({OR: [{isbn10: isbn}, {isbn13: isbn}]});
        }

        const allBooks = await (conditions.length > 0
            ? db.query.books.findMany({
                where: {
                    AND: conditions
                }
            })
            : db.select().from(books));

        res.json(allBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({message: 'Error fetching books'});
    }
};

export const getBookById = async (_req: Request, res: Response) => {
    try {
        const book = await db.select().from(books).where(eq(books.id, Number(_req.params.id))).limit(1);
        if (book.length === 0) {
            res.status(404).json({message: 'Book not found'});
        } else {
            res.json(book);
        }
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({message: 'Error fetching book'});
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
        // with: {
        //     book: true
        // }
    });
    res.json(notes);
};