import {Router} from "express";
import {createNote, deleteNote, getAllNotesForUser, getNoteById, updateNote} from "../controllers/noteController.ts";

const router = Router();

router.post("/", createNote);
router.get("/", getAllNotesForUser);
router.get("/:noteId", getNoteById);
router.put("/:noteId", updateNote);
router.delete("/:noteId", deleteNote);

export default router;