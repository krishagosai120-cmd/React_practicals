
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Homepage
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Employee Management API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f1f5f9;
                    margin: 0;
                    padding: 40px 20px;
                    color: #1e293b;
                }
                .container {
                    max-width: 800px;
                    margin: auto;
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px #0002;
                }
                h1 { color: #2563eb; }
                .route {
                    display: block;
                    padding: 15px;
                    margin: 12px 0;
                    background: #eff6ff;
                    color: #1d4ed8;
                    text-decoration: none;
                    border-radius: 8px;
                }
                .route:hover { background: #dbeafe; }
                .method { font-weight: bold; margin-right: 10px; }
                .note {
                    background: #fef3c7;
                    padding: 12px;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Employee Management API</h1>
                <p>Express.js and MongoDB Atlas</p>

                <h2>Available GET Routes</h2>

                <a class="route" href="/api/employees">
                    <span class="method">GET</span> View All Employees
                </a>

                <p>To find an employee, use /api/employees/EMPLOYEE_ID</p>

                <h2>Other API Operations</h2>

                <div class="route">
                    <span class="method">POST</span>
                    /api/employees — Add Employee
                </div>

                <div class="route">
                    <span class="method">PUT</span>
                    /api/employees/EMPLOYEE_ID — Update Employee
                </div>

                <div class="route">
                    <span class="method">DELETE</span>
                    /api/employees/EMPLOYEE_ID — Delete Employee
                </div>

                <p class="note">
                    Use Postman to test POST, PUT and DELETE requests.
                    Replace EMPLOYEE_ID with the actual MongoDB ID.
                </p>
            </div>
        </body>
        </html>
    `);
});

// GET: Retrieve all employees
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await Employee.find();

        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve employees.'
        });
    }
});

// GET: Retrieve one employee by ID
app.get('/api/employees/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID.'
            });
        }

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve employee.'
        });
    }
});

// POST: Add a new employee
app.post('/api/employees', async (req, res) => {
    try {
        const { name, email, department, salary } = req.body || {};

        if (
            typeof name !== 'string' || !name.trim() ||
            typeof email !== 'string' || !email.trim() ||
            typeof department !== 'string' || !department.trim() ||
            salary === undefined || salary === null || salary === '' ||
            !Number.isFinite(Number(salary)) || Number(salary) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Provide a name, email, department and valid salary.'
            });
        }

        const employee = await Employee.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            department: department.trim(),
            salary: Number(salary)
        });

        res.status(201).json({
            success: true,
            message: 'Employee added successfully.',
            data: employee
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An employee with this email already exists.'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to add employee.'
        });
    }
});

// PUT: Update an employee
app.put('/api/employees/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID.'
            });
        }

        const allowedFields = ['name', 'email', 'department', 'salary'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Provide at least one field to update.'
            });
        }

        if ('name' in updates) {
            if (typeof updates.name !== 'string' || !updates.name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Name cannot be empty.'
                });
            }
            updates.name = updates.name.trim();
        }

        if ('email' in updates) {
            if (typeof updates.email !== 'string' || !updates.email.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Email cannot be empty.'
                });
            }
            updates.email = updates.email.trim().toLowerCase();
        }

        if ('department' in updates) {
            if (
                typeof updates.department !== 'string' ||
                !updates.department.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Department cannot be empty.'
                });
            }
            updates.department = updates.department.trim();
        }

        if ('salary' in updates) {
            if (
                updates.salary === '' ||
                !Number.isFinite(Number(updates.salary)) ||
                Number(updates.salary) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Salary must be a valid non-negative number.'
                });
            }
            updates.salary = Number(updates.salary);
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully.',
            data: employee
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An employee with this email already exists.'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update employee.'
        });
    }
});

// DELETE: Remove an employee
app.delete('/api/employees/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID.'
            });
        }

        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully.',
            data: employee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete employee.'
        });
    }
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON request body.'
        });
    }

    console.error(err);
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

// Connect to MongoDB Atlas before starting the server
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from the .env file.');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas successfully.');

        app.listen(PORT, () => {
            console.log(`Employee Management API running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Could not start the application:', error.message);
        process.exit(1);
    }
}

startServer();
