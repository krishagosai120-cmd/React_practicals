
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// Custom middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Sample book data
let books = [
    { id: 1, title: 'The Alchemist', author: 'Paulo Coelho' },
    { id: 2, title: 'Atomic Habits', author: 'James Clear' },
    { id: 3, title: 'Ikigai', author: 'Hector Garcia' }
];

// Homepage with clickable route links
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>BookVerse API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f0f4f8;
                    margin: 0;
                    padding: 40px 20px;
                    color: #243047;
                }
                .container {
                    max-width: 850px;
                    margin: auto;
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                }
                h1 { color: #2563eb; }
                h2 { margin-top: 30px; }
                .route {
                    display: block;
                    background: #eff6ff;
                    padding: 15px;
                    margin: 12px 0;
                    border-radius: 8px;
                    text-decoration: none;
                    color: #1d4ed8;
                    font-weight: bold;
                }
                .route:hover { background: #dbeafe; }
                .method {
                    display: inline-block;
                    background: #dcfce7;
                    color: #166534;
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-right: 10px;
                }
                .note {
                    background: #fff7ed;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 25px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📚 BookVerse API</h1>
                <p>Welcome to the BookVerse backend server built with Express.js.</p>

                <h2>Available GET Routes</h2>

                <a class="route" href="/api/books">
                    <span class="method">GET</span> View All Books
                </a>

                <a class="route" href="/api/books/1">
                    <span class="method">GET</span> View Book with ID 1
                </a>

                <a class="route" href="/api/books/2">
                    <span class="method">GET</span> View Book with ID 2
                </a>

                <a class="route" href="/api/books/99">
                    <span class="method">GET</span> Test Book Not Found
                </a>

                <h2>Other API Routes</h2>

                <div class="route">
                    <span class="method">POST</span>
                    /api/books — Add a book using Postman
                </div>

                <div class="route">
                    <span class="method">DELETE</span>
                    /api/books/:id — Delete a book using Postman
                </div>

                <div class="note">
                    <strong>Note:</strong> GET routes can be opened directly in
                    your browser. Use Postman to test POST and DELETE requests.
                </div>
            </div>
        </body>
        </html>
    `);
});

// GET: Retrieve all books
app.get('/api/books', (req, res) => {
    res.status(200).json({
        success: true,
        count: books.length,
        data: books
    });
});

// GET: Retrieve one book
app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid book ID.'
        });
    }

    const book = books.find(item => item.id === id);

    if (!book) {
        return res.status(404).json({
            success: false,
            message: 'Book not found.'
        });
    }

    res.status(200).json({
        success: true,
        data: book
    });
});

// POST: Add a new book
app.post('/api/books', (req, res) => {
    const { title, author } = req.body || {};

    if (
        typeof title !== 'string' || !title.trim() ||
        typeof author !== 'string' || !author.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: 'Both title and author are required.'
        });
    }

    const newBook = {
        id: books.length
            ? Math.max(...books.map(book => book.id)) + 1
            : 1,
        title: title.trim(),
        author: author.trim()
    };

    books.push(newBook);

    res.status(201).json({
        success: true,
        message: 'Book added successfully.',
        data: newBook
    });
});

// DELETE: Remove a book
app.delete('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(book => book.id === id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid book ID.'
        });
    }

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Book not found.'
        });
    }

    const deletedBook = books.splice(index, 1)[0];

    res.status(200).json({
        success: true,
        message: 'Book deleted successfully.',
        data: deletedBook
    });
});

// Handle invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON in request body.'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error.'
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`BookVerse server running at http://localhost:${PORT}`);
});
