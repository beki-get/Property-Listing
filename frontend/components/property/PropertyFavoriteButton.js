'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useFavoritesStore from '../../store/favoritesStore';

export default function PropertyFavoriteButton({ property }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isFavorited, add, remove, init, initialized } = useFavoritesStore();
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (user && !initialized) init();
  }, [user, initialized]);

  const favorited = isFavorited(property.id);

  async function handleToggle() {
    if (!user) { router.push('/login'); return; }
    setToggling(true);
    try {
      if (favorited) {
        await remove(property.id);
        setToast('Removed from saved');
      } else {
        await add(property.id, property);
        setToast('Saved to favorites');
      }
      setTimeout(() => setToast(''), 2000);
    } catch {
      setToast('Something went wrong');
      setTimeout(() => setToast(''), 2000);
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={toggling}
        aria-label={favorited ? 'Remove from saved' : 'Save property'}
        className={`p-2.5 rounded-xl border transition-all ${
          favorited
            ? 'bg-red-50 border-red-200 text-red-500'
            : 'border-ink-200 text-ink-400 hover:border-ink-300 hover:text-red-400'
        }`}
      >
        <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
      </button>
      {toast && (
        <div className="absolute top-12 right-0 bg-ink-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
          {toast}
        </div>
      )}
    </div>
  );
}