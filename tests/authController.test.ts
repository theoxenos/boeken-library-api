import {vi} from "vitest";
import supertest from "supertest";
import jwt, {JwtPayload} from 'jsonwebtoken';
import {createTestDb} from "../src/db/testDb.ts";
import {eq} from "drizzle-orm";
import {users} from "../src/db/schema.ts";
import {resetDatabase, seedUsers} from "./dbUtils.ts";

// Must be called before any imports that use `db`
const testDb = await createTestDb();
vi.mock("../src/db/index.ts", () => ({
    db: testDb,
}));

const {default: app} = await import("../src/app.ts");
const api = supertest(app);

describe("POST /api/auth/register", () => {
    beforeEach(async () => {
        await resetDatabase(testDb);
    });

    it("should register a new user and return 204", async () => {
        await api
            .post("/api/auth/register")
            .send({name: "Alice", email: "alice@example.com", password: "secret123"})
            .expect(204);

        const userQueryResult = await testDb.select().from(users).where(eq(users.email, "alice@example.com"));
        expect(userQueryResult).toHaveLength(1);
        expect(userQueryResult[0].name).toBe("Alice");
        expect(userQueryResult[0].email).toBe("alice@example.com");
        expect(userQueryResult[0].passwordHash).not.toBe("secret123");
    });

    it('should fail with wrong credentials', async () => {
        const res = await api
            .post("/api/auth/register")
            .send({name: "Alice", email: "alice@example.com"})
            .expect(400)
            .expect("content-type", /application\/json/);

        expect(res.body.properties.password).toBeDefined();
        expect(res.body.properties.email).not.toBeDefined();
        expect(res.body.properties.name).not.toBeDefined();
    });
});

describe("POST /api/auth/login", () => {
    beforeAll(async () => {
        await resetDatabase(testDb);
        await seedUsers(testDb);
    });

    it('should fail with wrong credentials', async () => {
        await api
            .post("/api/auth/login")
            .send({email: "alice@example.com", password: "wrongpassword"})
            .expect(401);
    });

    it("should login a user and return 200", async () => {
        await api
            .post("/api/auth/login")
            .send({email: "alice@example.com", password: "secret123"})
            .expect("content-type", /application\/json/)
            .expect(200);
    });

    it('should return a valid jwt token', async () => {
        const res = await api
            .post("/api/auth/login")
            .send({email: "alice@example.com", password: "secret123"})
            .expect("content-type", /application\/json/)
            .expect(200);

        expect(res.body.token).toBeDefined();
        expect(res.body.token).not.toBe("");

        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET!) as JwtPayload;
        expect(decoded).toBeDefined();
        expect(decoded.email).toBe("alice@example.com");
        expect(decoded.userId).toBeDefined();
        expect(decoded.iat).toBeDefined();
    });
});