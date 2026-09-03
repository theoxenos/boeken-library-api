import * as argon2 from "argon2";
import jwt from "jsonwebtoken";

export const singleUserForTesting = {
    name: "Alice",
    email: "alice@example.com",
    password: "secret123"
};

export const multipleUsersForTesting = [
    {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        password: "secret123"
    },
    {
        id: 2,
        name: "Test User 2",
        email: "test2@test.com",
        password: "test2"
    },
    {
        id: 3,
        name: "Charlie",
        email: "charlie@example.com",
        password: "secret789"
    },
];

export const hashPassword = async (password: string) => {
    return argon2.hash(password, {secret: Buffer.from(process.env.HASH_SECRET!)});
};

export const generateTokenForUser = async (userId: number) => {
    return jwt.sign({userId}, process.env.JWT_SECRET!, {expiresIn: "1h"});
};