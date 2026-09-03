import {vi} from "vitest";
import supertest from "supertest";
import {createTestDb} from "../src/db/testDb.ts";
import {books} from "../src/db/schema.ts";
import {booksForTesting} from "./booksTestHelper.ts";
import {count, eq} from "drizzle-orm";
import {notesForTesting} from "./notesTestHelper.ts";
import {initializeTestData} from "./dbUtils.ts";

// Must be called before any imports that use `db`
const testDb = await createTestDb();
vi.mock("../src/db/index.ts", () => ({
    db: testDb,
}));

const {default: app} = await import("../src/app.ts");
const api = supertest(app);

describe("GET /api/books", () => {
    let token: string;

    beforeAll(async () => {
        const data = await initializeTestData(testDb);
        token = data.token;
    });

    it('should return all books', async () => {
        const response = await api
            .get('/api/books')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toEqual(
            expect.arrayContaining(
                booksForTesting.map(book =>
                    expect.objectContaining(book)
                )
            )
        );
    });

    it('should filter books by author when called with author query arguments', async () => {
        const response = await api
            .get(`/api/books?author=${booksForTesting[0].author}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toEqual(
            expect.objectContaining(booksForTesting[0])
        );
    });

    it('should filter books by title when called with title query arguments', async () => {
        const response = await api
            .get(`/api/books?title=${booksForTesting[0].title}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toEqual(
            expect.objectContaining(booksForTesting[0])
        );
    });

    it('should return one book when called with valid id', async () => {
        const response = await api
            .get(`/api/books/${booksForTesting[0].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(response.body).toEqual(expect.objectContaining(booksForTesting[0]));
    });

    it('should return status 404 when id does not exist', async () => {
        const response = await api
            .get(`/api/books/999`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
        expect(response.body).toEqual({message: 'Book not found'});
    });
});

describe('GET /api/books/isbn/', () => {
    let token: string;

    beforeAll(async () => {
        const data = await initializeTestData(testDb);
        token = data.token;
    });

    it('should return one book when called with valid isbn', async () => {
        const response = await api
            .get(`/api/books/isbn/${booksForTesting[0].isbn10}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(response.body).toEqual(expect.objectContaining(booksForTesting[0]));
    });
    //
    // it('should return status 404 when isbn does not exist', async () => {
    //     const response = await api
    //         .get(`/api/books/isbn/999`)
    //         .set('Authorization', `Bearer ${token}`)
    //         .expect(404);
    //     expect(response.body).toEqual({message: 'Book not found'});
    // });
});

describe('GET /api/books/:bookId/notes', () => {
    let token: string;

    beforeAll(async () => {
        const data = await initializeTestData(testDb, { users: true, books: true, notes: true });
        token = data.token;
    });

    it('should only show notes for current user', async () => {
        const response = await api
            .get('/api/books/1/notes')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const expectedNotes = notesForTesting.filter(
            note => note.bookId === 1 && note.userId === 1
        );

        expect(response.body).toEqual(
            expect.arrayContaining(
                expectedNotes.map(note => expect.objectContaining(note))
            )
        );
    });

    it('should return status 404 when book does not exist', async () => {
        const response = await api
            .get('/api/books/999/notes')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
        expect(response.body).toEqual({error: 'Book not found'});
    });

    it('should return status 401 when no token is provided', async () => {
        const response = await api
            .get('/api/books/1/notes')
            .expect(401);
        expect(response.body).toEqual({error: 'No token provided'});
    });

    it('should return status 401 when invalid token is provided', async () => {
        const response = await api
            .get('/api/books/1/notes')
            .set('Authorization', 'Bearer invalidToken')
            .expect(401);
        expect(response.body).toEqual({error: 'Invalid token'});
    });
});

describe('POST /api/books/', () => {
    let token: string;

    beforeAll(async () => {
        const data = await initializeTestData(testDb, { users: true, books: false });
        token = data.token;
    });

    it('should create a new book when valid data is posted', async () => {
        const {id, ...testBook} = booksForTesting[0];
        const response = await api
            .post('/api/books/')
            .set('Authorization', `Bearer ${token}`)
            .send(testBook)
            .expect(201);

        const bookFromDb = await testDb.select().from(books).where(eq(books.isbn10, testBook.isbn10));
        expect(bookFromDb[0]).toEqual(expect.objectContaining(testBook));
        expect(response.body).toEqual(expect.objectContaining(testBook));
    });

    it('should return status 400 when invalid data is posted', async () => {
        const response = await api
            .post('/api/books/')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400);
        expect(response.body.properties.author.errors).toBeDefined();
        expect(response.body.properties.title.errors).toBeDefined();
    });

    it('should return status 401 when no token is provided', async () => {
        const response = await api
            .post('/api/books/')
            .send({})
            .expect(401);
        expect(response.body).toEqual({error: 'No token provided'});
    });
});

describe('PUT /api/books/', () => {
    let token: string;

    beforeAll(async () => {
        const data = await initializeTestData(testDb);
        token = data.token;
    });

    it('should return status 404 when non existing id is posted', async () => {
        const response = await api
            .put('/api/books/100')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(404);
        expect(response.body).toEqual({message: 'Book not found'});
    });

    it('should update the book when valid data', async () => {
        const response = await api
            .put('/api/books/1')
            .set('Authorization', `Bearer ${token}`)
            .send({title: 'New title'})
            .expect(200);
        expect(response.body[0].title).toEqual('New title');

        const bookFromDb = await testDb.select().from(books).where(eq(books.id, 1));
        expect(bookFromDb[0].title).toEqual('New title');

        const bookCountWithNewTitle = await testDb.select({count: count()}).from(books).where(eq(books.title, 'New title'));
        expect(bookCountWithNewTitle[0].count).toEqual(1);
    });

    it('should return status 400 when invalid data is posted', async () => {
        const response = await api
            .put('/api/books/1')
            .set('Authorization', `Bearer ${token}`)
            .send({title: ''})
            .expect(400);
        expect(response.body).toEqual({message: 'Invalid data'});
    });

    it('should return status 401 when no token is provided', async () => {
        const response = await api
            .put('/api/books/1')
            .send({title: 'New title'})
            .expect(401);
        expect(response.body).toEqual({error: 'No token provided'});
    });

    it('should return status 401 when invalid token is provided', async () => {
        const response = await api
            .put('/api/books/1')
            .set('Authorization', `Bearer invalid`)
            .send({title: 'New title'})
            .expect(401);
        expect(response.body).toEqual({error: 'Invalid token'});
    });
});

describe('DELETE /api/books', () => {
    let token: string;

    beforeAll(async () => {
        const data = await initializeTestData(testDb);
        token = data.token;
    });

    it('should delete the book with a valid id', async () => {
        await api
            .delete('/api/books/1')
            .set('Authorization', `Bearer ${token}`)
            .expect(204);
        const bookFromDb = await testDb.select().from(books).where(eq(books.id, 1));
        expect(bookFromDb.length).toEqual(0);

        const booksCount = await testDb.select({count: count()}).from(books);
        expect(booksCount[0].count).toEqual(2);
    });

    it('should return status 404 when book with given id does not exist', async () => {
        const response = await api
            .delete('/api/books/999')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
        expect(response.body).toEqual({message: 'Book not found'});
    });

    it('should return status 401 when no token is provided', async () => {
        const response = await api
            .put('/api/books/1')
            .send({title: 'New title'})
            .expect(401);
        expect(response.body).toEqual({error: 'No token provided'});
    });

    it('should return status 401 when invalid token is provided', async () => {
        const response = await api
            .put('/api/books/1')
            .set('Authorization', `Bearer invalid`)
            .send({title: 'New title'})
            .expect(401);
        expect(response.body).toEqual({error: 'Invalid token'});
    });
});