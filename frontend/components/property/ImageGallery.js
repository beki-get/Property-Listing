'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="card overflow-hidden">
        <div className="relative h-64 sm:h-80 bg-ink-100 flex items-center justify-center text-ink-300 text-5xl">
          🏠
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Main image */}
      <div className="relative h-64 sm:h-80 bg-ink-100">
        <Image
          src={images[active]}
          alt={`${title} — image ${active + 1}`}
          fill
          className="object-cover transition-opacity duration-200"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails — only show if more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-ink-50">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-12 rounded shrink-0 overflow-hidden border-2 transition-all ${
                active === i
                  ? 'border-forest-700'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}