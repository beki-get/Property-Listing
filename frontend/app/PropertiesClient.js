'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { propertyApi } from '../lib/api';
import PropertyCard from '../components/property/PropertyCard';
import { SkeletonCard, EmptyState, Pagination } from '../components/ui';
import useFavoritesStore from '../store/favoritesStore';
import useAuthStore from '../store/authStore';

export default function PropertiesClient({ initialData }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user }     = useAuthStore();
  const { init: initFavorites, initialized } = useFavoritesStore();

  const [properties, setProperties] = useState(initialData?.properties || []);
  const [pagination, setPagination] = useState(initialData?.pagination || null);
  const [loading, setLoading]       = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mainSearch, setMainSearch] = useState('');

  // Advanced filter
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
  });

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user && !initialized) initFavorites();
  }, [user, initialized, initFavorites]);

  async function fetchProperties(search = mainSearch, f = filters, p = page) {
    setLoading(true);
    try {
      // Send same value to both search and location
      // so backend finds matches in title, description AND location
      const params = {
        page: p,
        limit: 6,
        ...(search && { search }),
        ...(search && { location: search }),
        ...(f.minPrice && { minPrice: f.minPrice }),
        ...(f.maxPrice && { maxPrice: f.maxPrice }),
      };
      const data = await propertyApi.getAll(params);
      setProperties(data.data?.properties || []);
      setPagination(data.data?.pagination || null);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  const hasFilters = mainSearch || filters.minPrice || filters.maxPrice;

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchProperties(mainSearch, filters, 1);
  }

  function clearFilters() {
    setMainSearch('');
    setFilters({ minPrice: '', maxPrice: '' });
    setPage(1);
    fetchProperties('', { minPrice: '', maxPrice: '' }, 1);
  }

  function handlePageChange(p) {
    setPage(p);
    fetchProperties(mainSearch, filters, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="page">
      {/* search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              className="input pl-9"
              placeholder="Search by title, description or location..."
              value={mainSearch}
              onChange={(e) => setMainSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary gap-1.5 ${showFilters ? 'bg-ink-100' : ''}`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
            {(filters.minPrice || filters.maxPrice) && (
              <span className="w-1.5 h-1.5 rounded-full bg-forest-700 inline-block" />
            )}
          </button>
          <button type="submit" className="btn-primary">Search</button>
        </div>

        {showFilters && (
          <div className="mt-3 p-4 border border-ink-200 rounded-xl bg-ink-50 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="input-label">Min price (ETB)</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
              />
            </div>
            <div>
              <label className="input-label">Max price (ETB)</label>
              <input
                className="input"
                type="number"
                placeholder="Any"
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              />
            </div>
            <div className="flex items-end col-span-2 md:col-span-2">
              {hasFilters && (
                <button type="button" onClick={clearFilters} className="btn-secondary gap-1.5">
                  <X size={13} /> Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No properties found"
          body={
            hasFilters
              ? `No results for "${mainSearch}". Try a different keyword or location.`
              : 'No listings available yet. Check back soon.'
          }
          action={hasFilters && (
            <button onClick={clearFilters} className="btn-secondary">Clear search</button>
          )}
        />
      ) : (
        <>
          {pagination && (
            <p className="text-xs text-ink-400 mb-4">
              {pagination.totalProperties}{' '}
              {pagination.totalProperties === 1 ? 'property' : 'properties'} found
              {mainSearch && <span className="ml-1">for "<strong>{mainSearch}</strong>"</span>}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
