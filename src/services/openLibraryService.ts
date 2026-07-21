import {BookSearchParams, OpenLibraryClient} from "open-library-client";
import {BookInsertModel} from "../db/schema.ts";

const client = new OpenLibraryClient({
    timeout: 15000,
    headers: {
        "User-Agent": "OpenLibrary-Example/1.0.0",
    },
});

export const findBookByIsbn = async (isbn: string): Promise<BookInsertModel | null> => {
    const basicParams: BookSearchParams = {
        q: "",
        isbn: isbn,
    };
    const bookResponse = await client.searchBooks(basicParams);

    if (bookResponse.data.numFound === 0) {
        return null;
    }

    const bookData = bookResponse.data.docs[0];
    const isbnValue = bookData.isbn?.[0];
    return {
        title: bookData.title,
        author: bookData.author_name[0],
        publishedYear: bookData.publish_year?.[0] ?? bookData.first_publish_year,
        ...(isbnValue?.length === 10 && {isbn10: isbnValue}),
        ...(isbnValue?.length === 13 && {isbn13: isbnValue}),
        coverUrl: bookData.cover_i ? `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg` : null
    };
};