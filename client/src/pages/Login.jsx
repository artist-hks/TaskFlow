import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiError } from '../api/axios.js';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      const dest = location.state?.from || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setServerError(apiError(err, 'Unable to log in'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your TaskFlow account">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && (
          <div className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {serverError}
          </div>
        )}

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
              autoComplete="current-password"
              className="input pl-9"
              placeholder="••••••••"
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
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted dark:text-muted-dark">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-accent dark:text-accent-dark"
        >
          Sign up
        </Link>
      </p>

      <div className="mt-5 rounded-xl bg-canvas px-3.5 py-3 text-center text-[12px] text-muted dark:bg-canvas-dark dark:text-muted-dark">
        <span className="font-medium text-ink dark:text-ink-dark">Demo:</span>{' '}
        demo@taskflow.app / demo1234
      </div>
    </AuthLayout>
  );
}
