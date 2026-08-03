'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, friendlyError } from '../../../lib/api';
import useAuthStore from '../../../store/authStore';
import useFavoritesStore from '../../../store/favoritesStore';
import { Spinner, ErrorMessage } from '../../../components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const { init: initFavorites } = useFavoritesStore();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(form);
      const { user: userData, token } = res.data;
      setAuth(userData, token);
      await initFavorites();
      // Role-based redirect
      if (userData.role === 'admin')  router.push('/admin');
      else if (userData.role === 'owner') router.push('/dashboard');
      else router.push('/');
    } catch (err) {
      // Console for dev, friendly message for user
      console.error('[Login]', err);
      setError(friendlyError(err, 'login'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink-900">Welcome back</h1>
          <p className="text-ink-500 text-sm mt-1">Log in to your MelaHome account</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="input-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="input-label mb-0" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="text-xs text-forest-700 hover:text-forest-900">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? <Spinner size={15} className="text-white" /> : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-500 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-forest-700 font-medium hover:text-forest-900">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
