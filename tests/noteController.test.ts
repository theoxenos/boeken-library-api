import {vi} from "vitest";
import supertest from "supertest";
import {createTestDb} from "../src/db/testDb.ts";
import {notes} from "../src/db/schema.ts";
import {InferSelectModel} from "drizzle-orm";
import {notesForTesting} from "./notesTestHelper.ts";
import {initializeTestData} from "./dbUtils.ts";

// Must be called before any imports that use `db`
const testDb = await createTestDb();
vi.mock("../src/db/index.ts", () => ({
    db: testDb,
}));

const {default: app} = await import("../src/app.ts");
const api = supertest(app);

describe('GET /api/notes', () => {
    let token: string;
    let seededNotes: InferSelectModel<typeof notes>[];

    beforeAll(async () => {
        const data = await initializeTestData(testDb, {users: true, books: true, notes: true});
        token = data.token;
        seededNotes = data.seededNotes;
    });

    it('should return all notes', async () => {
        const response = await api.get('/api/notes').set('Authorization', `Bearer ${token}`).expect(200);

        const expectedNotes = notesForTesting.filter(
            note => note.userId === 1
        );

        expect(response.body).toEqual(expect.arrayContaining(expectedNotes.map(note => expect.objectContaining(note))));
    });

    it('should return the correct note with valid id', async () => {
        const response = await api.get(`/api/notes/1`).set('Authorization', `Bearer ${token}`).expect(200);

        const expectedNote = notesForTesting.find(
            note => note.id === 1 && note.userId === 1
        );

        expect(response.body).toEqual(expect.objectContaining(expectedNote));
    });
    
    it('should return 404 when trying to get a note from another user', async () => {
        const anotherUsersNote = seededNotes.find(note => note.userId !== seededNotes[0].userId);
        await api.get(`/api/notes/${anotherUsersNote!.id}`).set('Authorization', `Bearer ${token}`).expect(404);
    });

    it('should return 404 for invalid note id', async () => {
        await api.get(`/api/notes/999`).set('Authorization', `Bearer ${token}`).expect(404);
    });
});

describe('POST /api/notes/', () => {
    let token: string;
    beforeAll(async () => {
        const data = await initializeTestData(testDb, {users: true, books: true, notes: true});

        token = data.token;
    });

    it('should return the created note with 201 status', async () => {
        const newNote = {
            title: 'New Note',
            content: 'This is a new note.',
            bookId: 1,
        };

        const result = await api
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newNote)
            .expect(201);

        expect(result.body).toEqual(expect.objectContaining({
            ...newNote,
            id: expect.any(Number), // or UUID, depending on your schema
        }));
    });

    it('should persist the note to the database', async () => {
        const newNote = {
            title: 'New Note',
            content: 'This is a new note.',
            bookId: 1,
        };

        await api
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newNote)
            .expect(201);

        const noteFromDb = await testDb.query.notes.findFirst({
            where: {
                title: 'New Note',
            },
        });

        expect(noteFromDb).toEqual(expect.objectContaining(newNote));
    });

    it('should return status 400 when no valid data is sent', async () => {
        const result = await api
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400);

        expect(result.body.error.properties.bookId.errors).toBeDefined();
        expect(result.body.error.properties.content.errors).toBeDefined();
        expect(result.body.error.properties.title.errors).toBeDefined();
    });
});


describe('PUT /api/notes', () => {
    let token: string;
    let seededNotes: InferSelectModel<typeof notes>[];
    beforeAll(async () => {
        const data = await initializeTestData(testDb, {users: true, books: true, notes: true});

        token = data.token;
        seededNotes = data.seededNotes;
    });

    it('should update the note and send status 200 with valid data', async () => {
        const result = await api
            .put('/api/notes/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'New title',
                content: 'New content',
            })
            .expect(200);

        expect(result.body).toEqual(expect.objectContaining({
            title: 'New title',
            content: 'New content',
        }));
    });

    it('should return 404 when id does not exist', () => {
        return api
            .put('/api/notes/999')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(404);
    });

    it('should return 404 when the logged in user tries to update another user\'s note', async () => {
        const anotherUsersNote = seededNotes.find(note => note.userId !== seededNotes[0].userId);
        await api
            .put(`/api/notes/${anotherUsersNote!.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'New title',
                content: 'New content',
            })
            .expect(404);

        const noteFromDb = await testDb.query.notes.findFirst({where: {id: anotherUsersNote!.id}})
        expect(noteFromDb).not.toEqual(expect.objectContaining({
            title: 'New title',
            content: 'New content',
        }));
    });

    it('should return status 400 when no valid data is sent', async () => {
        const result = await api
            .put('/api/notes/1')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400);

        expect(result.body.error.properties.title.errors).toBeDefined();
        expect(result.body.error.properties.content.errors).toBeDefined();
    });
});

describe('DELETE /api/notes/', () => {
    let token: string;
    let seededNotes: InferSelectModel<typeof notes>[];
    beforeAll(async () => {
        const data = await initializeTestData(testDb, {users: true, books: true, notes: true});

        token = data.token;
        seededNotes = data.seededNotes;
    });

    it('should delete the note', async () => {
        const noteToDelete = seededNotes[0];
        await api
            .delete(`/api/notes/${noteToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const noteFromDb = await testDb.query.notes.findFirst({where: {id: noteToDelete.id}})
        expect(noteFromDb).not.toBeDefined();
    });

    it('should not delete the note from another user and return 404', async () => {
        const anotherUsersNote = seededNotes.find(note => note.userId !== seededNotes[0].userId);
        await api
            .delete(`/api/notes/${anotherUsersNote!.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });

    it('should return 404 when id does not exist', () => {
        return api
            .delete('/api/notes/999')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });
});