import {Request, Response} from "express";
import {insertNoteSchema, updateNoteSchema} from "../schemas/databaseZodSchemas.ts";
import {z} from "zod";
import {db} from "../db/index.ts";
import {notes} from "../db/schema.ts";
import {RequestWithUser} from "../types/index.ts";
import {and, eq} from "drizzle-orm";

type BaseParams = Record<string, string>;
interface NoteParams extends BaseParams {
    noteId: string;
}

export const createNote = async (req: Request, res: Response) => {
    const {user} = req as RequestWithUser;
    const parseResult = insertNoteSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({error: z.treeifyError(parseResult.error)});
        return;
    }

    const [newNote] = await db.insert(notes).values({...parseResult.data, userId: user.id}).returning();
    res.status(201).json(newNote);
};

export const getAllNotesForUser = async (req: Request, res: Response) => {
    const {user} = req as RequestWithUser;
    const notesForUser = await db.query.notes.findMany({
        where: {userId: user.id}
    });
    res.status(200).json(notesForUser);
};

export const getNoteById = async (req: Request, res: Response) => {
    const {user} = req as RequestWithUser;
    const {noteId} = (req as Request<NoteParams>).params;
    const note = await db.query.notes.findFirst({
        where: {
            AND: [
                {id: Number(noteId)},
                {userId: user.id}
            ]
        }
    });
    if (!note) {
        res.status(404).json({error: "Note not found"});
        return;
    }
    res.status(200).json(note);
};

export const updateNote = async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const { noteId } = (req as Request<NoteParams>).params;

    const parseResult = updateNoteSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ error: z.treeifyError(parseResult.error) });
        return;
    }

    const [updatedNote] = await db
        .update(notes)
        .set({
            ...parseResult.data,
            updatedAt: new Date()
        })
        .where(and(eq(notes.id, Number(noteId)), eq(notes.userId, user.id)))
        .returning();

    if (!updatedNote) {
        res.status(404).json({ error: "Note not found" });
        return;
    }

    res.status(200).json(updatedNote);
};

export const deleteNote = async (req: Request, res: Response) => {
    const {user} = req as RequestWithUser;
    const {noteId} = (req as Request<NoteParams>).params;
    const [deletedNote] = await db.delete(notes).where(and(eq(notes.id, Number(noteId)), eq(notes.userId, user.id))).returning();
    if (!deletedNote) {
        res.status(404).json({error: "Note not found"});
        return;
    }
    res.status(200).json(deletedNote);
};