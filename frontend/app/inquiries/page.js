'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { inquiryApi, friendlyError } from '../../lib/api';
import { LoadingPage, EmptyState, ErrorMessage } from '../../components/ui';

export default function InquiriesPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    // Admins don't have "my inquiries" — redirect to admin panel
    if (isAdmin()) { router.replace('/admin'); return; }
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await inquiryApi.mySent();
      setInquiries(data.data?.inquiries || []);
    } catch (err) {
      console.error('[Inquiries]', err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  if (!user || loading) return <LoadingPage />;

  return (
    <div className="page">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-ink-700" />
        <h1 className="page-title">My inquiries</h1>
        {inquiries.length > 0 && (
          <span className="badge bg-ink-100 text-ink-600 ml-1">{inquiries.length}</span>
        )}
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {inquiries.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No inquiries sent yet"
          body="When you contact a property owner, your messages will appear here."
          action={<Link href="/" className="btn-primary">Browse properties</Link>}
        />
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="card p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/properties/${inq.propertyId}`}
                    className="text-sm font-medium text-forest-800 hover:text-forest-900 transition-colors"
                  >
                    {inq.property?.title || 'View property'} →
                  </Link>
                  {inq.property?.location && (
                    <p className="text-xs text-ink-400 mt-0.5">{inq.property.location}</p>
                  )}
                  <p className="text-sm text-ink-700 mt-2 leading-relaxed">{inq.message}</p>
                  {inq.phone && (
                    <p className="text-xs text-ink-400 mt-1.5">📞 {inq.phone}</p>
                  )}
                </div>
                <span className="text-xs text-ink-400 shrink-0 pt-0.5">
                  {new Date(inq.createdAt).toLocaleDateString('en-ET', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
