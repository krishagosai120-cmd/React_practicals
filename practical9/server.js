const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const File = require('./models/File');

app.use(express.urlencoded({ extended: true }));

// Create uploads folder if it does not exist
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure where and how files are stored
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1E9) + extension;

        cb(null, uniqueName);
    }
});

// Allow common document and image formats
const allowedTypes = [
    'application/pdf',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, TXT, JPG, PNG, GIF, DOC and DOCX files are allowed.'));
        }
    }
});

// Escape text before displaying it in HTML
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

// Homepage with upload form
app.get('/', async (req, res) => {
    try {
        const files = await File.find().sort({ uploadDate: -1 });

        const fileRows = files.map(file => `
            <tr>
                <td>${escapeHtml(file.originalName)}</td>
                <td>${escapeHtml(file.mimetype)}</td>
                <td>${(file.size / 1024).toFixed(2)} KB</td>
                <td>${new Date(file.uploadDate).toLocaleString()}</td>
                <td>
                    <a href="/files/${encodeURIComponent(file._id.toString())}">
                        View
                    </a>
                </td>
            </tr>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>FileVault - File Upload System</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f1f5f9;
                        margin: 0;
                        padding: 30px;
                    }
                    .container {
                        max-width: 950px;
                        margin: auto;
                        background: white;
                        padding: 25px;
                        border-radius: 10px;
                    }
                    h1, h2 { color: #243b64; }
                    .upload-box {
                        padding: 20px;
                        background: #eef4ff;
                        border-radius: 8px;
                        margin-bottom: 25px;
                    }
                    input, button { padding: 10px; margin-top: 10px; }
                    button {
                        background: #315da8;
                        color: white;
                        border: 0;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 12px;
                        border-bottom: 1px solid #ddd;
                        text-align: left;
                    }
                    th { background: #e8edf5; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>FileVault</h1>
                    <p>File Upload Management System using Multer and MongoDB</p>

                    <div class="upload-box">
                        <h2>Upload a File</h2>
                        <form action="/upload" method="POST"
                              enctype="multipart/form-data">
                            <input type="file" name="myFile" required>
                            <br>
                            <button type="submit">Upload File</button>
                        </form>
                        <p>Maximum file size: 5 MB</p>
                        <p>Allowed formats: PDF, TXT, JPG, PNG, GIF, DOC, DOCX</p>
                    </div>

                    <h2>Uploaded Files</h2>
                    <table>
                        <tr>
                            <th>File Name</th>
                            <th>File Type</th>
                            <th>Size</th>
                            <th>Upload Date</th>
                            <th>Action</th>
                        </tr>
                        ${fileRows || '<tr><td colspan="5">No files uploaded yet.</td></tr>'}
                    </table>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Could not load files. Check the server terminal.');
    }
});

// Upload a file and save its metadata in MongoDB
app.post('/upload', (req, res) => {
    upload.single('myFile')(req, res, async (error) => {
        if (error) {
            return res.status(400).send(`
                <h2>Upload Error</h2>
                <p>${escapeHtml(error.message)}</p>
                <a href="/">Go Back</a>
            `);
        }

        if (!req.file) {
            return res.status(400).send('Please select a file. <a href="/">Go Back</a>');
        }

        try {
            await File.create({
                originalName: req.file.originalname,
                filename: req.file.filename,
                path: 'uploads/' + req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            res.redirect('/');
        } catch (dbError) {
            // Remove the saved file if its metadata could not be saved
            fs.unlink(req.file.path, () => {});
            console.error(dbError);
            res.status(500).send('File metadata could not be saved to MongoDB.');
        }
    });
});

// View/download a file using its MongoDB ID
app.get('/files/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid file ID.');
        }

        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).send('File record not found.');
        }

        const filePath = path.join(__dirname, file.path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).send('The file is missing from the uploads folder.');
        }

        res.download(filePath, file.originalName);
    } catch (error) {
        console.error(error);
        res.status(500).send('Could not retrieve the file.');
    }
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).send('Page not found. <a href="/">Return Home</a>');
});

// Connect to MongoDB before starting the server
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from the .env file.');
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Connected to MongoDB Atlas successfully.');

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`FileVault running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Could not start the application:', error.message);
        process.exit(1);
    }
}

startServer();