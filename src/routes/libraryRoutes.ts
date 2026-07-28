import {Router} from "express";
import {addBookToUserLibrary, removeBookFromUserLibrary} from "../controllers/userLibraryController.ts";

const router = Router();

router.post("/", addBookToUserLibrary);
router.delete("/:bookId", removeBookFromUserLibrary);

export default router;