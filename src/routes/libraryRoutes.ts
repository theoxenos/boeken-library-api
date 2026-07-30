import {Router} from "express";
import {
    addBookToUserLibrary,
    getBooksFromUserLibrary,
    removeBookFromUserLibrary
} from "../controllers/userLibraryController.ts";

const router = Router();

router.post("/", addBookToUserLibrary);
router.delete("/:bookId", removeBookFromUserLibrary);
router.get("/", getBooksFromUserLibrary);

export default router;