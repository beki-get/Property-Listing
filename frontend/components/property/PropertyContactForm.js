'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { inquiryApi, friendlyError } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { ErrorMessage, SuccessMessage, Spinner } from '../ui';

export default function PropertyContactForm({ propertyId }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [inquiry, setInquiry] = useState({ message: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    setLoading(true);
    setError('');
    try {
      await inquiryApi.send(propertyId, inquiry);
      setDone(true);
      setInquiry({ message: '', phone: '' });
    } catch (err) {
      console.error('[ContactForm]', err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5 sticky top-20">
      <h3 className="section-title mb-0.5">Contact owner</h3>
      <p className="text-ink-400 text-xs mb-4">Send a message about this listing</p>

      {done ? (
        <div>
          <SuccessMessage message="Your message was sent. The owner will get back to you." />
          <button
            onClick={() => setDone(false)}
            className="btn-secondary btn-sm w-full mt-3"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <ErrorMessage message={error} />}
          <div>
            <label className="input-label text-xs" htmlFor="message">Message</label>
            <textarea
              id="message"
              className="input resize-none text-sm"
              rows={4}
              placeholder="I'm interested in this property. Is it still available?"
              value={inquiry.message}
              onChange={(e) => setInquiry((i) => ({ ...i, message: e.target.value }))}
              required
              minLength={10}
            />
          </div>
          <div>
            <label className="input-label text-xs" htmlFor="phone">
              Phone number <span className="text-ink-400 font-normal">(required)</span>
            </label>
            <input
              id="phone"
              className="input text-sm"
              placeholder="+251 9XX XXX XXXX"
              value={inquiry.phone}
              onChange={(e) => setInquiry((i) => ({ ...i, phone: e.target.value }))}
              required
            />
          </div>
          {!user && (
            <p className="text-xs text-ink-500">
              <Link href="/login" className="text-forest-700 font-medium underline">
                Log in
              </Link>{' '}
              to send a message to the owner.
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !user}
            className="btn-primary w-full gap-2"
          >
            {loading ? <Spinner size={13} className="text-white" /> : <Send size={13} />}
            {loading ? 'Sending...' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  );
}