import * as schema from "./schema.ts";
import {defineRelations} from "drizzle-orm";

export const relations = defineRelations(schema, (r) =>({
    users: {
        books: r.many.books({
            from: r.users.id.through(r.usersToBooks.userId),
            to: r.books.id.through(r.usersToBooks.bookId)
        }),
        notes: r.many.notes()
    },
    books: {
        users: r.many.users({
            from: r.books.id.through(r.usersToBooks.bookId),
            to: r.users.id.through(r.usersToBooks.userId),
        }),
        notes: r.many.notes()
    },
    notes: {
        author: r.one.users({
            from: r.notes.userId,
            to: r.users.id
        }),
        book: r.one.books({
            from: r.notes.bookId,
            to: r.books.id
        })
    },
}));

// export const relations = defineRelations(schema, (r) => (
//     {
//         parentTable: {
//             children: r.many.childTable(),
//         },
//         childTable: {
//             parent: r.one.parentTable({
//                 from: r.childTable.parentId,
//                 to: r.parentTable.id
//             }),
//         }
//     }
// ));