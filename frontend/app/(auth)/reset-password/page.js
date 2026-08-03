'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi, friendlyError } from '../../../lib/api';
import { Spinner, ErrorMessage, SuccessMessage } from '../../../components/ui';

function ResetForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  if (!token) {
    return (
      <div>
        <p className="alert-error">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="btn-secondary inline-flex mt-4">Request a new link</Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      console.error('[ResetPassword]', err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div>
        <SuccessMessage message="Password reset successfully. Redirecting you to log in..." />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-ink-900 mb-1">Set new password</h1>
      <p className="text-ink-500 text-sm mb-6">Choose a new password for your account.</p>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="input-label" htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            required
            minLength={6}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? <Spinner size={15} className="text-white" /> : 'Reset password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
