import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, FolderOpen } from 'lucide-react';
import API from '../api';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await API.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      alert('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">
          <span className="logo-icon">
            <FolderOpen size={25} />
          </span>
          DocuVault
        </div>

        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Get started with secure document management.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              maxLength={80}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            <UserPlus size={17} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;