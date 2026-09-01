const {JWT_SECRET, HASH_SECRET, DATABASE_URL} = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}
if (!HASH_SECRET) {
    throw new Error('HASH_SECRET is not defined');
}

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const hashSecret = HASH_SECRET;
const jwtSecret = JWT_SECRET;
const databaseUrl = DATABASE_URL;

export {hashSecret, jwtSecret, databaseUrl};