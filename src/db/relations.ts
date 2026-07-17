import * as schema from "./schema.ts";
import {defineRelations} from "drizzle-orm";

export const relations = defineRelations(schema, (r) =>({
    users: {
        books: r.many.books(),
        notes: r.many.notes()
    },
    books: {
        users: r.many.users(),
        notes: r.many.notes()
    },
    notes: {
        author: r.one.users(),
        book: r.one.books()
    },
}));