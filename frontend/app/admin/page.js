'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Building2, Users, Ban, Trash2, Search } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { propertyApi, userApi, friendlyError } from '../../lib/api';
import { LoadingPage, EmptyState, ErrorMessage, Pagination } from '../../components/ui';

const STATUS_STYLES = {
  draft:     'badge-draft',
  published: 'badge-published',
  archived:  'badge-archived',
  disabled:  'badge-disabled',
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [tab, setTab] = useState('properties');

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (!isAdmin()) { router.replace('/'); }
  }, [user]);

  if (!user || !isAdmin()) return <LoadingPage />;

  return (
    <div className="page">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={20} className="text-forest-800" />
        <h1 className="page-title">Admin panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-200 mb-6">
        {[
          { key: 'properties', label: 'Properties', icon: <Building2 size={14} /> },
          { key: 'users',      label: 'Users',      icon: <Users size={14} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-forest-800 text-forest-900'
                : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'properties' && <AdminProperties adminId={user.id} />}
      {tab === 'users'      && <AdminUsers adminId={user.id} />}
    </div>
  );
}

function AdminProperties({ adminId }) {
  const [properties, setProps] = useState([]);
  const [pagination, setPag]   = useState(null);
  const [loading, setLoading]  = useState(true);
  const [search, setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]        = useState(1);
  const [error, setError]      = useState('');
  const [actionId, setActionId] = useState(null);

  async function load(p = 1, s = search, st = statusFilter) {
    setLoading(true);
    setError('');
    try {
      const data = await propertyApi.adminAll({ page: p, limit: 10, search: s, status: st });
      setProps(data.data?.properties || []);
      setPag(data.data?.pagination || null);
      setPage(p);
    } catch (err) {
      console.error('[Admin/Props]', err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDisable(id) {
    if (!confirm('Disable this listing? It will be hidden from public view.')) return;
    setActionId(id);
    setError('');
    try {
      await propertyApi.disable(id);
      setProps((prev) => prev.map((p) => p.id === id ? { ...p, status: 'disabled' } : p));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Permanently delete this property?')) return;
    setActionId(id);
    setError('');
    try {
      await propertyApi.delete(id);
      setProps((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            className="input pl-9"
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(1, search, statusFilter)}
          />
        </div>
        <select
          className="input max-w-[150px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); load(1, search, e.target.value); }}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
          <option value="disabled">Disabled</option>
        </select>
        <button onClick={() => load(1, search, statusFilter)} className="btn-primary btn-sm">Search</button>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState icon="🏡" title="No properties found" />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100">
                <tr>
                  {['Title', 'Location', 'Price', 'Status', 'Owner', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink-900 max-w-[180px]">
                      <span className="line-clamp-1">{p.title}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-500 max-w-[120px]">
                      <span className="line-clamp-1">{p.location}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-700 whitespace-nowrap">
                      ETB {Number(p.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={STATUS_STYLES[p.status] || 'badge bg-ink-100 text-ink-500'}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500 text-xs max-w-[140px]">
                      <span className="truncate block">{p.owner?.email || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {p.status !== 'disabled' && (
                          <button
                            onClick={() => handleDisable(p.id)}
                            disabled={actionId === p.id}
                            className="btn-secondary btn-sm gap-1"
                          >
                            <Ban size={11} /> Disable
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={actionId === p.id}
                          className="btn-danger btn-sm gap-1"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => load(p)} />
        </>
      )}
    </div>
  );
}

function AdminUsers({ adminId }) {
  const [users, setUsers]      = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await userApi.getAll();
        setUsers(data.data?.users || []);
      } catch (err) {
        console.error('[Admin/Users]', err);
        setError(friendlyError(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Permanently delete this user account?')) return;
    setActionId(id);
    setError('');
    try {
      await userApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setActionId(null);
    }
  }

  const roleBadge = (role) => ({
    admin: 'bg-forest-900 text-white',
    owner: 'bg-forest-100 text-forest-800',
    user:  'bg-ink-100 text-ink-600',
  }[role] || 'bg-ink-100 text-ink-600');

  return (
    <div>
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {/* Summary cards */}
      {!loading && (
       <div className="grid grid-cols-4 gap-4 mb-6">
          {[
           { label: 'Total accounts', count: users.length,                                              color: 'text-ink-900' },
           { label: 'Admins',         count: users.filter((u) => u.role === 'admin').length,            color: 'text-forest-900' },
           { label: 'Owners',         count: users.filter((u) => u.role === 'owner').length,            color: 'text-forest-800' },
           { label: 'Buyers',         count: users.filter((u) => u.role === 'user').length,             color: 'text-ink-600' },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className={`text-xl font-semibold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-ink-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon="👤" title="No users found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100">
              <tr>
                {['Email', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink-900">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${roleBadge(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-ET')}
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== adminId && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={actionId === u.id}
                        className="btn-danger btn-sm gap-1"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
