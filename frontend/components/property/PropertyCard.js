'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Heart } from 'lucide-react';
import useFavoritesStore from '../../store/favoritesStore';
import useAuthStore from '../../store/authStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUS_BADGE = {
  draft:     'badge-draft',
  published: 'badge-published',
  archived:  'badge-archived',
  disabled:  'badge-disabled',
};

function formatPrice(price) {
  if (price >= 1_000_000) return `ETB ${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000)     return `ETB ${(price / 1_000).toFixed(0)}K`;
  return `ETB ${price}`;
}

export default function PropertyCard({ property, showStatus = false, footer }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isFavorited, add, remove } = useFavoritesStore();
  const [toggling, setToggling] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const favorited = isFavorited(property.id);
  const firstImage = property.images?.[0];

  async function handleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push('/login'); return; }
    setToggling(true);
    try {
      if (favorited) {
        await remove(property.id);
        setToastMsg('Removed from saved');
      } else {
        await add(property.id, property);
        setToastMsg('Saved');
      }
      setTimeout(() => setToastMsg(''), 1800);
    } catch {
      setToastMsg('Failed — try again');
      setTimeout(() => setToastMsg(''), 2000);
    } finally {
      setToggling(false);
    }
  }

  return (
    <article className="card-hover relative">
      {/* Image */}
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative h-44 bg-ink-100 overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ink-300 text-3xl select-none">
              🏠
            </div>
          )}

          {showStatus && property.status && (
            <div className="absolute top-2 left-2">
              <span className={STATUS_BADGE[property.status] || 'badge bg-ink-100 text-ink-500'}>
                {property.status}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Heart button — only for non-owner non-admin */}
      {!showStatus && (
        <button
          onClick={handleFavorite}
          disabled={toggling}
          aria-label={favorited ? 'Remove from saved' : 'Save property'}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
            favorited
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-ink-400 hover:text-red-400'
          }`}
        >
          <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      )}

      {/* Toast feedback */}
      {toastMsg && (
        <div className="absolute top-12 right-2 bg-ink-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10 pointer-events-none">
          {toastMsg}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <Link href={`/properties/${property.id}`} className="block group">
          <h3 className="font-semibold text-ink-900 text-sm leading-snug line-clamp-1 group-hover:text-forest-800 transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1 text-ink-400 text-xs">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        <p className="text-ink-500 text-xs mt-2 line-clamp-2 leading-relaxed">
          {property.description}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
          <span className="font-semibold text-ink-900 text-sm">
            {formatPrice(property.price)}
          </span>
          {footer ?? (
            <Link
              href={`/properties/${property.id}`}
              className="text-xs text-forest-700 hover:text-forest-900 font-medium"
            >
              View details →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
