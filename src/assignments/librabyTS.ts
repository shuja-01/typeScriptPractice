// Book interface :: to define book structure
interface Book {
    id: number;             // Unique identifier for the book
    title: string;          // Name of the book
    author: string;         // Name of the author
    isAvailable: boolean;   // Availability status: true if in library, false if borrowed
}

// generator function to generate uniqueIDs (1, 2, 3...)
function* bookIdGenerator(): Generator<number, void, void> {
    let currentId = 1;
    while (true) {
        yield currentId;
        currentId++;
    }
}

// CLASS: Library (PascalCase)
// Manages the collection of books and operations like adding, borrowing, and displaying.
class Library {
    // Array to store all books
    books: Book[] = [];

    // Generator instance used to generate sequential IDs for every new book
    idGenerator = bookIdGenerator();

    // addBook: Creates a new book using the generator for its ID and stores it
    addBook(title: string, author: string): void {
        const idResult = this.idGenerator.next();
        const newId = idResult.value as number;

        const newBook: Book = {
            id: newId,
            title: title,
            author: author,
            isAvailable: true,
        };

        this.books.push(newBook);
        console.log(`[Added] "${newBook.title}" by ${newBook.author} (ID: ${newBook.id})`);
    }

    // borrowBook: Borrows a book by its ID. Handles non-existing and borrowed books.
    borrowBook(bookId: number): void {
        const book = this.books.find((b) => b.id === bookId);

        // Case 1: The book does NOT exist
        if (!book) {
            console.log(`[Error] Book with ID ${bookId} was not found in the library!`);
            return;
        }

        // Case 2: The book is ALREADY borrowed
        if (!book.isAvailable) {
            console.log(`[Unavailable] "${book.title}" (ID: ${book.id}) is already borrowed by someone else.`);
            return;
        }

        // Case 3: Successfully borrow the book
        book.isAvailable = false;
        console.log(`[Success] You have borrowed "${book.title}" (ID: ${book.id}). Enjoy reading!`);
    }

    // displayAllBooks: Prints every book in the library with its status
    displayAllBooks(): void {
        console.log("\n=================== ALL BOOKS IN LIBRARY ===================");
        if (this.books.length === 0) {
            console.log("The library is currently empty.");
            return;
        }

        for (const book of this.books) {
            const status = book.isAvailable ? "[Available]" : "[Borrowed]";
            console.log(`ID: ${book.id} | Title: "${book.title}" | Author: ${book.author} | Status: ${status}`);
        }
        console.log("============================================================\n");
    }

    // displayAvailableBooks: Filters and prints only the books that can be borrowed
    displayAvailableBooks(): void {
        console.log("\n================ AVAILABLE BOOKS FOR BORROWING ===============");
        const availableBooks = this.books.filter((book) => book.isAvailable);

        if (availableBooks.length === 0) {
            console.log("No books are currently available.");
            return;
        }

        for (const book of availableBooks) {
            console.log(`ID: ${book.id} | "${book.title}" by ${book.author}`);
        }
        console.log("============================================================\n");
    }
}

// ============================================================================
// DEMONSTRATION OF THE LIBRARY SYSTEM
// ============================================================================

console.log("=== STEP 1: INITIALIZING LIBRARY & ADDING 5 BOOKS ===");
const cityLibrary = new Library();

// Adding at least 5 books (Generator assigns IDs 1, 2, 3, 4, 5 automatically)
cityLibrary.addBook("The Pragmatic Programmer", "Andy Hunt & Dave Thomas");
cityLibrary.addBook("Clean Code", "Robert C. Martin");
cityLibrary.addBook("You Don't Know JS", "Kyle Simpson");
cityLibrary.addBook("Design Patterns: Elements of Reusable Object-Oriented Software", "Gang of Four");
cityLibrary.addBook("Refactoring", "Martin Fowler");

// Display all books initially
cityLibrary.displayAllBooks();

console.log("=== STEP 2: BORROWING BOOKS (NORMAL CASES) ===");
cityLibrary.borrowBook(2);
cityLibrary.borrowBook(4);

console.log("\n=== STEP 3: EDGE CASES (ALREADY BORROWED & NON-EXISTING) ===");
cityLibrary.borrowBook(2);
cityLibrary.borrowBook(999);
cityLibrary.borrowBook(-5);

console.log("\n=== STEP 4: DISPLAYING ALL AVAILABLE BOOKS AFTER BORROWING ===");
cityLibrary.displayAvailableBooks();
