'use client';

import { useEffect, useState } from 'react';
import { inquiryApi, friendlyError } from '../../lib/api';
import { EmptyState, ErrorMessage } from '../../components/ui';
import { MessageSquare, Mail, CheckCircle2, Clock, Trash2, Phone, User, Home, Inbox } from 'lucide-react';

export default function OwnerInquiries({ properties }) {
  const [selected, setSelected] = useState('all');
  const [inquiries, setInq] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.all(
        properties.map((p) =>
          inquiryApi
            .forProperty(p.id)
            .then((data) => (data.data?.inquiries || []).map((inq) => ({ ...inq, propertyTitle: p.title })))
            .catch(() => [])
        )
      );
      const all = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInq(all);
    } catch (err) {
      console.error('[OwnerInquiries]', err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadOne(propertyId) {
    setLoading(true);
    setError('');
    try {
      const data = await inquiryApi.forProperty(propertyId);
      const prop = properties.find((p) => p.id === propertyId);
      const inqs = (data.data?.inquiries || []).map((inq) => ({ ...inq, propertyTitle: prop?.title }));
      setInq(inqs);
    } catch (err) {
      console.error('[OwnerInquiries]', err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(e) {
    const val = e.target.value;
    setSelected(val);
    if (val === 'all') loadAll();
    else loadOne(val);
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="w-10 h-10 text-ink-400 stroke-[1.5]" />}
        title="No listings yet"
        body="Add a property listing first to receive inquiries."
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <select className="input max-w-xs" value={selected} onChange={handleFilter}>
          <option value="all">All listings</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        {!loading && (
          <span className="text-xs text-ink-400">
            {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'}
          </span>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && inquiries.length === 0 && (
        <EmptyState
          icon={<Inbox className="w-10 h-10 text-ink-400 stroke-[1.5]" />}
          title="No inquiries yet"
          body="No one has contacted you about your listings yet."
        />
      )}

      {!loading && inquiries.length > 0 && (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-forest-800 mb-1.5 flex items-center gap-1.5">
                    <Home size={14} className="shrink-0" />
                    {inq.propertyTitle || 'Property'}
                  </p>
                  
                  <p className="text-sm text-ink-700 leading-relaxed">{inq.message}</p>
                  {inq.phone && (
                    <p className="text-xs text-ink-400 mt-1.5 flex items-center gap-1.5">
                      <Phone size={12} className="shrink-0" /> {inq.phone}
                    </p>
                  )}
                </div>
                <span className="text-xs text-ink-400 shrink-0">
                  {new Date(inq.createdAt).toLocaleDateString('en-ET')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}