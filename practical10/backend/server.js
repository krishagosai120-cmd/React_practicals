const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const Student = require('./models/Student');

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Student Management API is running.');
});

// GET: Retrieve all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve students.' });
    }
});

// POST: Add a new student
app.post('/api/students', async (req, res) => {
    try {
        const { name, email, course, age } = req.body;

        if (!name || !email || !course || age === undefined ||
            age === null || age === '') {
            return res.status(400).json({
                message: 'Please provide name, email, course, and age.'
            });
        }

        const student = await Student.create({
            name,
            email,
            course,
            age: Number(age)
        });

        res.status(201).json(student);
    } catch (error) {
        if (error.name === 'ValidationError' ||
            error.name === 'CastError') {
            return res.status(400).json({
                message: 'Please enter valid student details.'
            });
        }

        res.status(500).json({ message: 'Failed to add student.' });
    }
});

// PUT: Update an existing student
app.put('/api/students/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid student ID.' });
        }

        const { name, email, course, age } = req.body;

        if (!name || !email || !course || age === undefined ||
            age === null || age === '') {
            return res.status(400).json({
                message: 'Please provide name, email, course, and age.'
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { name, email, course, age: Number(age) },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        res.json(student);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update student.' });
    }
});

// DELETE: Remove a student
app.delete('/api/students/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid student ID.' });
        }

        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        res.json({ message: 'Student deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete student.' });
    }
});

// Start server only after connecting to MongoDB
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from the .env file.');
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Connected to MongoDB Atlas successfully.');

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Backend running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Could not start backend:', error.message);
        process.exit(1);
    }
}

startServer();