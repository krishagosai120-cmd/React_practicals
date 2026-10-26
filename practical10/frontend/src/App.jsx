import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/students';

function App() {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({
        name: '',
        email: '',
        course: '',
        age: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    async function fetchStudents() {
        try {
            const response = await axios.get(API_URL);
            setStudents(response.data);
        } catch (error) {
            setMessage('Could not load students. Check the backend server.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStudents();
    }, []);

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');

        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, form);
                setMessage('Student updated successfully!');
            } else {
                await axios.post(API_URL, form);
                setMessage('Student added successfully!');
            }

            setForm({ name: '', email: '', course: '', age: '' });
            setEditingId(null);
            await fetchStudents();
        } catch (error) {
            setMessage(
                error.response?.data?.message || 'Could not save student.'
            );
        }
    }

    function handleEdit(student) {
        setForm({
            name: student.name,
            email: student.email,
            course: student.course,
            age: String(student.age)
        });

        setEditingId(student._id);
        setMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleDelete(id) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this student?'
        );

        if (!confirmed) return;

        try {
            await axios.delete(`${API_URL}/${id}`);
            setMessage('Student deleted successfully!');

            if (editingId === id) {
                cancelEdit();
            }

            await fetchStudents();
        } catch (error) {
            setMessage(
                error.response?.data?.message || 'Could not delete student.'
            );
        }
    }

    function cancelEdit() {
        setForm({ name: '', email: '', course: '', age: '' });
        setEditingId(null);
        setMessage('');
    }

    return (
        <div className="app">
            <header className="header">
                <h1>Student Management System</h1>
                <p>Manage student records in one place</p>
            </header>

            <main className="container">
                <section className="form-card">
                    <h2>{editingId ? 'Update Student' : 'Add New Student'}</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter student name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="student@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="course">Course</label>
                                <select
                                    id="course"
                                    name="course"
                                    value={form.course}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a course</option>
                                    <option value="BCA">BCA</option>
                                    <option value="B.Sc. IT">B.Sc. IT</option>
                                    <option value="B.Tech">B.Tech</option>
                                    <option value="MCA">MCA</option>
                                    <option value="MBA">MBA</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    id="age"
                                    type="number"
                                    name="age"
                                    value={form.age}
                                    onChange={handleChange}
                                    placeholder="Enter age"
                                    min="1"
                                    max="120"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="primary-btn">
                                {editingId ? 'Update Student' : 'Add Student'}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={cancelEdit}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {message && (
                        <p className="message" role="status">{message}</p>
                    )}
                </section>

                <section className="table-card">
                    <h2>Registered Students ({students.length})</h2>

                    {loading ? (
                        <p>Loading students...</p>
                    ) : students.length === 0 ? (
                        <p className="empty">No students registered yet.</p>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Course</th>
                                        <th>Age</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id}>
                                            <td>{student.name}</td>
                                            <td>{student.email}</td>
                                            <td>{student.course}</td>
                                            <td>{student.age}</td>
                                            <td className="actions">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(student)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleDelete(student._id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            <footer>
                <p>Student Management System | MERN Stack Practical</p>
            </footer>
        </div>
    );
}

export default App;