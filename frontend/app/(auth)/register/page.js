'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, friendlyError } from '../../../lib/api';
import useAuthStore from '../../../store/authStore';
import useFavoritesStore from '../../../store/favoritesStore';
import { Spinner, ErrorMessage } from '../../../components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const { init: initFavorites } = useFavoritesStore();

  const [form, setForm]     = useState({ email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

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
      const res = await authApi.register(form);
      const { user: userData, token } = res.data;
      setAuth(userData, token);
      await initFavorites();
      if (userData.role === 'owner') router.push('/dashboard');
      else router.push('/');
    } catch (err) {
      console.error('[Register]', err);
      setError(friendlyError(err, 'register'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink-900">Create an account</h1>
          <p className="text-ink-500 text-sm mt-1">Join MelaHome today</p>
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
            <label className="input-label" htmlFor="password">
              Password <span className="text-ink-400 font-normal">(min. 8 characters)</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="input-label" htmlFor="role">I want to</label>
            <select
              id="role"
              name="role"
              className="input"
              value={form.role}
              onChange={handleChange}
            >
              <option value="user"> Buy</option>
              <option value="owner"> Sell</option>
            </select>
            <p className="text-xs text-ink-400 mt-1">
              {form.role === 'owner'
                ? 'Owners can create and manage property listings.'
                : 'Buyers can browse, save favorites, and contact owners.'}
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? <Spinner size={15} className="text-white" /> : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-forest-700 font-medium hover:text-forest-900">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
