import { Router } from 'express';
import {
    getBooks,
    createBook,
    getBookById,
    deleteBook,
    updateBook,
    getBookByIsbn, getAllNotesForBook
} from '../controllers/bookController.ts';

const router = Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.get('/:id/notes', getAllNotesForBook);
router.get('/isbn/:isbn', getBookByIsbn);
router.post('/', createBook);
router.delete('/:id', deleteBook);
router.put('/:id', updateBook);

export default router;
