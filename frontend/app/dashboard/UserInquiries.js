'use client';

import Link from 'next/link';
import { EmptyState } from '../../components/ui';

export default function UserInquiries({ inquiries, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <EmptyState
        icon="💬"
        title="No inquiries sent yet"
        body="When you contact a property owner, your messages will appear here."
        action={
          <Link href="/" className="btn-primary">
            Browse properties
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inq) => (
        <div key={inq.id} className="card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Link
                href={`/properties/${inq.propertyId}`}
                className="text-sm font-medium text-forest-800 hover:text-forest-900 transition-colors"
              >
                View property →
              </Link>
              <p className="text-sm text-ink-700 mt-1">{inq.message}</p>
              {inq.phone && <p className="text-xs text-ink-400 mt-1"><Phone size={12} className="shrink-0" /> {inq.phone}</p>}
            </div>
            <span className="text-xs text-ink-400 shrink-0">
              {new Date(inq.createdAt).toLocaleDateString('en-ET')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}