import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, FolderOpen } from 'lucide-react';
import API from '../api';

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
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
    setLoading(true);

    try {
      const response = await API.post('/auth/login', form);
      const data = response.data;

      const token = data.token || data.accessToken;
      const user = data.user || data;

      if (!token) {
        setError('Login response did not contain an authentication token.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Check your details and backend server.'
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

        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to access and manage your documents securely.
        </p>

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            <LockKeyhole size={17} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;