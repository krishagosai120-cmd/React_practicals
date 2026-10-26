
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to read JSON data
app.use(express.json());

// Sample student records
let students = [
    { id: 1, name: 'Krisha Gosai', course: 'B.Sc. IT', age: 20 },
    { id: 2, name: 'Riya Patel', course: 'BCA', age: 21 },
    { id: 3, name: 'Aarav Shah', course: 'B.Sc. IT', age: 20 }
];

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to Student Records Management API');
});

// GET: Retrieve all students
app.get('/api/students', (req, res) => {
    res.status(200).json({
        success: true,
        data: students
    });
});

// GET: Retrieve a student by ID
app.get('/api/students/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid student ID'
        });
    }

    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    res.status(200).json({
        success: true,
        data: student
    });
});

// POST: Add a new student
app.post('/api/students', (req, res) => {
    const { name, course, age } = req.body || {};

    if (
        typeof name !== 'string' || !name.trim() ||
        typeof course !== 'string' || !course.trim() ||
        age === undefined || age === null || age === '' ||
        !Number.isInteger(Number(age)) ||
        Number(age) <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: 'Provide a valid name, course, and positive age'
        });
    }

    const newStudent = {
        id: students.length
            ? Math.max(...students.map(s => s.id)) + 1
            : 1,
        name: name.trim(),
        course: course.trim(),
        age: Number(age)
    };

    students.push(newStudent);

    res.status(201).json({
        success: true,
        message: 'Student added successfully',
        data: newStudent
    });
});

// PUT: Update a student
app.put('/api/students/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid student ID'
        });
    }

    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    const { name, course, age } = req.body || {};

    if (
        (name !== undefined &&
            (typeof name !== 'string' || !name.trim())) ||
        (course !== undefined &&
            (typeof course !== 'string' || !course.trim())) ||
        (age !== undefined &&
            (age === '' || !Number.isInteger(Number(age)) ||
             Number(age) <= 0))
    ) {
        return res.status(400).json({
            success: false,
            message: 'Please provide valid student details'
        });
    }

    if (name !== undefined) student.name = name.trim();
    if (course !== undefined) student.course = course.trim();
    if (age !== undefined) student.age = Number(age);

    res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: student
    });
});

// DELETE: Remove a student
app.delete('/api/students/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid student ID'
        });
    }

    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    const deletedStudent = students.splice(index, 1)[0];

    res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
        data: deletedStudent
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON request body'
        });
    }

    console.error(err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Student API running at http://localhost:${PORT}`);
});
