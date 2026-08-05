import {Router} from "express";
import {
    addBookToUserLibrary,
    getBooksFromUserLibrary,
    removeBookFromUserLibrary,
    updateLibraryBookData
} from "../controllers/userLibraryController.ts";

const router = Router();

router.post("/", addBookToUserLibrary);
router.delete("/:bookId", removeBookFromUserLibrary);
router.get("/", getBooksFromUserLibrary);
router.put("/:bookId", updateLibraryBookData);

export default router;