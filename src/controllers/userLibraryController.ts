import {Request, Response} from "express";
import {RequestWithUser} from "../types/index.ts";
import {db} from "../db/index.ts";
import {usersToBooks} from "../db/schema.ts";
import {and, eq} from "drizzle-orm";

export const addBookToUserLibrary = async (req: Request<object, object, { bookId: number }>, res: Response) => {
    const {user} = req as RequestWithUser;
    const {bookId} = req.body;

    const isBookAlreadyInLibrary = await db.query.usersToBooks.findFirst({where: {bookId}});
    if (isBookAlreadyInLibrary) {
        return res.status(409).send({message: "Book already in Library"});
    }

    const newEntry = await db.insert(usersToBooks).values({
            userId: user.id,
            bookId: bookId,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ).returning();

    return res.status(201).send(newEntry);
};

export const removeBookFromUserLibrary = async (req: Request, res: Response) => {
    const {user} = req as RequestWithUser;
    const {bookId} = req.params;

    const deletedBook = await db.delete(usersToBooks).where(
        and(
            eq(usersToBooks.bookId, Number(bookId)),
            eq(usersToBooks.userId, user.id)
        )
    );

    if (!deletedBook) {
        return res.status(404).send({message: "Book not found"});
    }

    return res.status(204).send({message: "Book removed from Library"});
};