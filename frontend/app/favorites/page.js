'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useFavoritesStore from '../../store/favoritesStore';
import PropertyCard from '../../components/property/PropertyCard';
import { LoadingPage, EmptyState, SkeletonCard } from '../../components/ui';

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { favorites, loading, init, initialized, remove } = useFavoritesStore();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (!initialized) init();
  }, [user, initialized]);

  if (!user || (loading && !initialized)) return <LoadingPage />;

  async function handleRemove(propertyId) {
    try { await remove(propertyId); }
    catch { /* store handles rollback */ }
  }

  return (
    <div className="page">
      <div className="flex items-center gap-2 mb-6">
        <Heart size={20} className="text-ink-700" />
        <h1 className="page-title">Saved properties</h1>
        {favorites.length > 0 && (
          <span className="badge bg-ink-100 text-ink-600 ml-1">{favorites.length}</span>
        )}
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="Nothing saved yet"
          body="Browse listings and tap the heart icon to save properties you like."
          action={<Link href="/" className="btn-primary">Browse properties</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((fav) => {
            const prop = fav.property || {
              id: fav.propertyId,
              title: 'Property',
              location: '',
              price: 0,
              images: [],
              description: '',
              status: 'published',
            };
            return (
              <PropertyCard
                key={fav.id}
                property={prop}
                footer={
                  <button
                    onClick={() => handleRemove(fav.propertyId)}
                    className="btn-danger btn-sm gap-1"
                  >
                    <Trash2 size={11} /> Remove
                  </button>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
