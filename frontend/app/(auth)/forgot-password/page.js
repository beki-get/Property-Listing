'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { authApi, friendlyError } from '../../../lib/api';
import { Spinner, ErrorMessage, SuccessMessage } from '../../../components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [sent, setSent]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      console.error('[ForgotPassword]', err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to log in
        </Link>

        {sent ? (
          <div>
            <h1 className="text-2xl font-semibold text-ink-900 mb-2">Check your inbox</h1>
            <SuccessMessage message={`If an account exists for ${email}, a reset link has been sent. Check your spam folder if you don't see it.`} />
            <Link href="/login" className="btn-primary inline-flex mt-6">Back to log in</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-ink-900 mb-1">Reset password</h1>
            <p className="text-ink-500 text-sm mb-6">
              Enter your email and we'll send a reset link if an account exists.
            </p>
            <ErrorMessage message={error} />
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="input-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? <Spinner size={15} className="text-white" /> : 'Send reset link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
