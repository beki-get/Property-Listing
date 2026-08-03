import { Suspense } from 'react';
import PropertiesClient from './PropertiesClient';
import { Search, Home, MessageSquare, Heart } from 'lucide-react';

const FEATURES = [
  {
    icon: <Search size={22} className="text-forest-700" />,
    title: 'Search across Ethiopia',
    body: 'Filter by location, price, and property type to find exactly what you need.',
  },
  {
    icon: <Home size={22} className="text-forest-700" />,
    title: 'List your property',
    body: 'Owners can create listings, add images, and publish in minutes.',
  },
  {
    icon: <MessageSquare size={22} className="text-forest-700" />,
    title: 'Contact owners directly',
    body: 'Send inquiries straight to the owner — no middlemen, no delays.',
  },
  {
    icon: <Heart size={22} className="text-forest-700" />,
    title: 'Save your favorites',
    body: 'Bookmark properties you like and come back to them anytime.',
  },
];

async function getInitialProperties(searchParams) {
  const params = new URLSearchParams();
  if (searchParams?.page)     params.set('page', searchParams.page);
  if (searchParams?.location) params.set('location', searchParams.location);
  if (searchParams?.search)   params.set('search', searchParams.search);
  if (searchParams?.minPrice) params.set('minPrice', searchParams.minPrice);
  if (searchParams?.maxPrice) params.set('maxPrice', searchParams.maxPrice);
  params.set('limit', '9');

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL }/properties?${params}`,
       { cache: 'no-store' }
    );
    if (!res.ok) return { properties: [], pagination: null };
    const data = await res.json();
    return data.data || { properties: [], pagination: null };
  } catch {
    return { properties: [], pagination: null };
  }
}

export default async function HomePage({ searchParams }) {
  const initialData = await getInitialProperties(searchParams);

  return (
    <div>
      {/* Hero */}
      <section className="bg-forest-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-forest-100/70 text-sm mb-2 font-medium tracking-wide uppercase">
            Welcome to MelaHome
          </p>
          <h1 className="font-serif italic text-3xl sm:text-4xl text-white mb-1 leading-tight">
            The place to find property in Ethiopia
          </h1>
          <p className="text-forest-100/80 text-sm mt-2">
            Apartments, houses, villas and commercial spaces across Addis Ababa and beyond.
          </p>
        </div>
      </section>

      <Suspense fallback={null}>
        <PropertiesClient initialData={initialData} />
      </Suspense>

      {/* Features section */}
      <section className="border-t border-ink-100 bg-ink-50 py-14 px-4 mt-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold text-forest-700 uppercase tracking-widest mb-2">
              Why MelaHome
            </p>
            <h2 className="text-xl font-semibold text-ink-900">
              Everything you need in one place
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-ink-200 rounded-xl p-5">
                <span className="block mb-3">{f.icon}</span>
                <h3 className="font-semibold text-ink-900 text-sm mb-1">{f.title}</h3>
                <p className="text-ink-500 text-xs leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200 bg-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-forest-900 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <span className="text-sm font-semibold text-ink-900">
              Mela<span className="text-forest-700">Home</span>
            </span>
          </div>
          <p className="text-xs text-ink-400 text-center">
            Ethiopian property listings — apartments, houses, villas and commercial spaces.
          </p>
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} MelaHome. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}