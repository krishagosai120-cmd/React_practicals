import { useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = 'Enter a valid email';
    if (form.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!form.course) newErrors.course = 'Please select a course';

    setErrors(newErrors);
    setSuccess('');

    if (Object.keys(newErrors).length === 0) {
      setSuccess(`Registration successful! Welcome, ${form.name}.`);
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        course: ''
      });
    }
  }

  return (
    <div className="container">
      <h1>Student Registration</h1>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
        <p className="error">{errors.name}</p>

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />
        <p className="error">{errors.email}</p>

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />
        <p className="error">{errors.password}</p>

        <label>Confirm Password</label>
        <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
        <p className="error">{errors.confirmPassword}</p>

        <label>Select Course</label>
        <select name="course" value={form.course} onChange={handleChange}>
          <option value="">Choose a course</option>
          <option value="React Development">React Development</option>
          <option value="Web Development">Web Development</option>
          <option value="Python Programming">Python Programming</option>
        </select>
        <p className="error">{errors.course}</p>

        <button type="submit">Register</button>
      </form>

      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default App;