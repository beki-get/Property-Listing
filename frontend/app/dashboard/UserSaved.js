'use client';

import Link from 'next/link';
import { Trash2,Heart  } from 'lucide-react';
import PropertyCard from '../../components/property/PropertyCard';
import { EmptyState, SkeletonCard } from '../../components/ui';

export default function UserSaved({ favorites, loading, onRemoveFav }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-10 h-10 text-rose-500 fill-rose-500/10 stroke-[1.5]" />}
        title="No saved properties yet"
        body="Browse listings and tap the heart to save ones you like."
        action={
          <Link href="/" className="btn-primary">
            Browse properties
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {favorites.map((fav) => {
        const prop = fav.property || {
          id: fav.propertyId,
          title: 'Property',
          location: '',
          price: 0,
          images: [],
          description: '',
        };
        return (
          <PropertyCard
            key={fav.id}
            property={prop}
            footer={
              <button onClick={() => onRemoveFav(fav.propertyId)} className="btn-danger btn-sm gap-1">
                <Trash2 size={11} /> Remove
              </button>
            }
          />
        );
      })}
    </div>
  );
}