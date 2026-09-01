import {books} from "./src/db/schema.ts";
import {db} from "./src/db/index.ts";

const booksJson = [
    {
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "isbn10": "0048231886",
        "isbn13": "9780048231888",
        "publishedYear": 1981,
    },
    {
        "title": "The Lord of the Rings",
        "author": "J. R. R. Tolkien",
        "publishedYear": 1954,
        "isbn10": "0618640150",
        "isbn13": "9780618640157",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0618640150-L.jpg"
    },
    {
        "title": "Harry Potter and the Philosopher's Stone",
        "author": "J. K. Rowling",
        "publishedYear": 1997,
        "isbn10": "0439708184",
        "isbn13": "9780439708180",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0439708184-L.jpg"
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "publishedYear": 1949,
        "isbn10": "0451524934",
        "isbn13": "9780451524935",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0451524934-L.jpg"
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "publishedYear": 1813,
        "isbn10": "0141439513",
        "isbn13": "9780141439518",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0141439513-L.jpg"
    },
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "publishedYear": 1925,
        "isbn10": "0743273567",
        "isbn13": "9780743273565",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0743273567-L.jpg"
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "publishedYear": 1960,
        "isbn10": "0446310786",
        "isbn13": "9780446310789",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0446310786-L.jpg"
    },
    {
        "title": "Jane Eyre",
        "author": "Charlotte Brontë",
        "publishedYear": 1847,
        "isbn10": "0141441143",
        "isbn13": "9780141441146",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0141441143-L.jpg"
    },
    {
        "title": "Wuthering Heights",
        "author": "Emily Brontë",
        "publishedYear": 1847,
        "isbn10": "0141439556",
        "isbn13": "9780141439556",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0141439556-L.jpg"
    },
    {
        "title": "The Catcher in the Rye",
        "author": "J. D. Salinger",
        "publishedYear": 1951,
        "isbn10": "0316769487",
        "isbn13": "9780316769488",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0316769487-L.jpg"
    },
    {
        "title": "Brave New World",
        "author": "Aldous Huxley",
        "publishedYear": 1932,
        "isbn10": "0060850523",
        "isbn13": "9780060850524",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0060850523-L.jpg"
    },
    {
        "title": "Animal Farm",
        "author": "George Orwell",
        "publishedYear": 1945,
        "isbn10": "0452284244",
        "isbn13": "9780452284241",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0452284244-L.jpg"
    },
    {
        "title": "Lord of the Flies",
        "author": "William Golding",
        "publishedYear": 1954,
        "isbn10": "0399501487",
        "isbn13": "9780399501487",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0399501487-L.jpg"
    },
    {
        "title": "The Lion, the Witch and the Wardrobe",
        "author": "C. S. Lewis",
        "publishedYear": 1950,
        "isbn10": "0064471047",
        "isbn13": "9780064471046",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0064471047-L.jpg"
    },
    {
        "title": "Fahrenheit 451",
        "author": "Ray Bradbury",
        "publishedYear": 1953,
        "isbn10": "1451673310",
        "isbn13": "9781451673319",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/1451673310-L.jpg"
    },
    {
        "title": "Of Mice and Men",
        "author": "John Steinbeck",
        "publishedYear": 1937,
        "isbn10": "0140177396",
        "isbn13": "9780140177398",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0140177396-L.jpg"
    },
    {
        "title": "The Grapes of Wrath",
        "author": "John Steinbeck",
        "publishedYear": 1939,
        "isbn10": "0143039431",
        "isbn13": "9780143039433",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0143039431-L.jpg"
    },
    {
        "title": "Moby Dick",
        "author": "Herman Melville",
        "publishedYear": 1851,
        "isbn10": "0142437247",
        "isbn13": "9780142437247",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0142437247-L.jpg"
    },
    {
        "title": "War and Peace",
        "author": "Leo Tolstoy",
        "publishedYear": 1869,
        "isbn10": "1400079985",
        "isbn13": "9781400079988",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/1400079985-L.jpg"
    },
    {
        "title": "Crime and Punishment",
        "author": "Fyodor Dostoevsky",
        "publishedYear": 1866,
        "isbn10": "0140449132",
        "isbn13": "9780140449136",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/0140449132-L.jpg"
    },
    {
        "title": "The Republic",
        "author": "Plato",
        "publishedYear": -375,
        "isbn10": "0141442433",
        "isbn13": "9780141442433",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780141442433-L.jpg"
    },
    {
        "title": "On Liberty",
        "author": "John Stuart Mill",
        "publishedYear": 1859,
        "isbn10": "0140443487",
        "isbn13": "9780140443486",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140443486-L.jpg"
    },
    {
        "title": "Le Morte d'Arthur",
        "author": "Sir Thomas Malory",
        "publishedYear": 1485,
        "isbn10": "0140430431",
        "isbn13": "9780140430431",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140430431-L.jpg"
    },
    {
        "title": "The Epic of Gilgamesh",
        "author": "Anonymous",
        "publishedYear": -2100,
        "isbn10": "0140449194",
        "isbn13": "9780140449198",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140449198-L.jpg"
    },
    {
        "title": "Beowulf",
        "author": "Unknown",
        "publishedYear": 1000,
        "isbn10": "0393320979",
        "isbn13": "9780143039952",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780393320978-L.jpg"
    },
    {
        "title": "The Book of Job",
        "author": "Anonymous",
        "publishedYear": -600,
        "isbn10": "0140441000",
        "isbn13": "9780140441000",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140441000-L.jpg"
    },
    {
        "title": "The Oresteia",
        "author": "Aeschylus",
        "publishedYear": -458,
        "isbn10": "0140443339",
        "isbn13": "9780140443332",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140443332-L.jpg"
    },
    {
        "title": "All Quiet on the Western Front",
        "author": "Erich Maria Remarque",
        "publishedYear": 1928,
        "isbn10": "0345424735",
        "isbn13": "9780143138761",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780345424736-L.jpg"
    },
    {
        "title": "The Analects",
        "author": "Confucius",
        "publishedYear": -475,
        "isbn10": "0140443487",
        "isbn13": "9780140443486",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140443486-L.jpg"
    },
    {
        "title": "Julius Caesar",
        "author": "William Shakespeare",
        "publishedYear": 1599,
        "isbn10": "0140449337",
        "isbn13": "9780140449334",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg"
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "publishedYear": 1949,
        "isbn10": "0141036141",
        "isbn13": "9780141036144",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780141036144-L.jpg"
    },
    {
        "title": "The Aeneid",
        "author": "Virgil",
        "publishedYear": -19,
        "isbn10": "0143106295",
        "isbn13": "9780143106296",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780143106296-L.jpg"
    },
    {
        "title": "Prometheus Bound",
        "author": "Aeschylus",
        "publishedYear": -430,
        "isbn10": "0140441123",
        "isbn13": "9780140441123",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140441123-L.jpg"
    },
    {
        "title": "The Gulag Archipelago",
        "author": "Aleksandr Solzhenitsyn",
        "publishedYear": 1973,
        "isbn10": "0060007761",
        "isbn13": "9780143037511",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780060007766-L.jpg"
    },
    {
        "title": "Pericles' Funeral Oration",
        "author": "Pericles",
        "publishedYear": -431,
        "isbn10": "0486268721",
        "isbn13": "9780486268729",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780486268729-L.jpg"
    },
    {
        "title": "Gettysburg Address",
        "author": "Abraham Lincoln",
        "publishedYear": 1863,
        "isbn10": "0486268721",
        "isbn13": "9780486268729",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780486268729-L.jpg"
    },
    {
        "title": "The Divine Comedy",
        "author": "Dante Alighieri",
        "publishedYear": 1320,
        "isbn10": "0140448446",
        "isbn13": "9780140448445",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140448445-L.jpg"
    },
    {
        "title": "The Iliad",
        "author": "Homer",
        "publishedYear": -750,
        "isbn10": "0140275363",
        "isbn13": "9780140275360",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140275360-L.jpg"
    },
    {
        "title": "The Odyssey",
        "author": "Homer",
        "publishedYear": -725,
        "isbn10": "0140268863",
        "isbn13": "9780140268866",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140268866-L.jpg"
    },
    {
        "title": "Meditations",
        "author": "Marcus Aurelius",
        "publishedYear": 180,
        "isbn10": "0140449337",
        "isbn13": "9780140449334",
        "coverUrl": "https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg"
    }
];

await db.insert(books).values(booksJson);