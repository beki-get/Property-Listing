'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, MessageSquare, Plus, Eye, Send } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useFavoritesStore from '../../store/favoritesStore';
import { propertyApi, inquiryApi, friendlyError } from '../../lib/api';
import { LoadingPage, ErrorMessage } from '../../components/ui';
import CreatePropertyForm from './CreatePropertyForm';
import OwnerListings from './OwnerListings';
import OwnerInquiries from './OwnerInquiries';
import UserSaved from './UserSaved';
import UserInquiries from './UserInquiries';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');

  const { user, isOwner, isUser } = useAuthStore();
  const { favorites, loading: favLoading, init: initFavorites, initialized, remove: removeFav } = useFavoritesStore();

  const [tab, setTab] = useState('properties');
  const [properties, setProps] = useState([]);
  const [propPagination, setPropPag] = useState(null);
  const [propLoading, setPropLoad] = useState(false);
  const [propPage, setPropPage] = useState(1);
  const [inquiries, setInq] = useState([]);
  const [inqLoading, setInqLoad] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const loggedIn = Boolean(user);

  useEffect(() => {
    if (!loggedIn) {
      router.replace('/login');
      return;
    }
    if (!initialized) initFavorites();

    if (isOwner()) {
      fetchProperties(1);
      setTab(initialTab === 'inquiries' ? 'inquiries' : 'properties');
    } else if (isUser()) {
      setTab(initialTab === 'inquiries' ? 'inquiries' : 'saved');
      if (initialTab === 'inquiries') fetchInquiries();
    }
  }, [loggedIn, user, initialTab]);

  async function fetchProperties(page = 1) {
    setPropLoad(true);
    try {
      const data = await propertyApi.myProperties({ page, limit: 6 });
      setProps(data.data?.properties || []);
      setPropPag(data.data?.pagination || null);
      setPropPage(page);
    } catch (err) {
      console.error('[Dashboard/Props]', err);
    } finally {
      setPropLoad(false);
    }
  }

  async function fetchInquiries() {
    setInqLoad(true);
    try {
      const data = await inquiryApi.mySent();
      setInq(data.data?.inquiries || []);
    } catch (err) {
      console.error('[Dashboard/Inq]', err);
    } finally {
      setInqLoad(false);
    }
  }

  async function handlePublish(id) {
    setActionError('');
    try {
      await propertyApi.publish(id);
      fetchProperties(propPage);
      router.refresh();
    } catch (err) {
      setActionError(friendlyError(err, 'publish'));
    }
  }

  async function handleArchive(id) {
    setActionError('');
    try {
      await propertyApi.archive(id);
      fetchProperties(propPage);
    } catch (err) {
      setActionError(friendlyError(err));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this property? This cannot be undone.')) return;
    setActionError('');
    try {
      await propertyApi.delete(id);
      fetchProperties(propPage);
    } catch (err) {
      setActionError(friendlyError(err));
    }
  }

  async function handleRemoveFav(propertyId) {
    try {
      await removeFav(propertyId);
    } catch {
      /* handled in store */
    }
  }

  if (!loggedIn) return <LoadingPage />;

  const ownerTabs = [
    { key: 'properties', label: 'My listings', icon: <Eye size={14} /> },
    { key: 'inquiries', label: 'Inbox', icon: <MessageSquare size={14} /> },
  ];

  const userTabs = [
    { key: 'saved', label: 'Saved properties', icon: <Heart size={14} /> },
    { key: 'inquiries', label: 'Sent inquiries', icon: <Send size={14} /> },
  ];

  const tabs = isOwner() ? ownerTabs : userTabs;

  function handleTabChange(key) {
    setTab(key);
    if (key === 'inquiries' && isUser() && inquiries.length === 0) {
      fetchInquiries();
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="page-title">{isOwner() ? 'Owner dashboard' : 'My account'}</h1>
          <p className="text-ink-500 text-sm mt-0.5">{user?.email}</p>
        </div>
        {isOwner() && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary gap-2 shrink-0">
            <Plus size={15} /> Add listing
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && isOwner() && (
        <div className="mb-6">
          <CreatePropertyForm
            onSuccess={() => {
              setShowCreate(false);
              fetchProperties(1);
            }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {actionError && (
        <div className="mb-4">
          <ErrorMessage message={actionError} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key ? 'border-forest-800 text-forest-900' : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'properties' && isOwner() && (
        <OwnerListings
          properties={properties}
          loading={propLoading}
          pagination={propPagination}
          editingId={editingId}
          setEditingId={setEditingId}
          propPage={propPage}
          onPublish={handlePublish}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onPageChange={fetchProperties}
          onAddNew={() => setShowCreate(true)}
        />
      )}

      {tab === 'inquiries' && isOwner() && <OwnerInquiries properties={properties} />}

      {tab === 'saved' && isUser() && (
        <UserSaved favorites={favorites} loading={favLoading} onRemoveFav={handleRemoveFav} />
      )}

      {tab === 'inquiries' && isUser() && <UserInquiries inquiries={inquiries} loading={inqLoading} />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <DashboardContent />
    </Suspense>
  );
}