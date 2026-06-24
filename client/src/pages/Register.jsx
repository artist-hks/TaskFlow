import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiError } from '../api/axios.js';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(apiError(err, 'Unable to create account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start organizing your work with TaskFlow">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && (
          <div className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {serverError}
          </div>
        )}

        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark"
            />
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="input pl-9"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-[12px] text-danger">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark"
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input pl-9"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[12px] text-danger">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark"
            />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input pl-9"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-[12px] text-danger">{errors.password}</p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted dark:text-muted-dark">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-accent dark:text-accent-dark"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
