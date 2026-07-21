const {JWT_SECRET, HASH_SECRET} = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}
if (!HASH_SECRET) {
    throw new Error('HASH_SECRET is not defined');
}

const hashSecret = HASH_SECRET;
const jwtSecret = JWT_SECRET;

export {hashSecret, jwtSecret};