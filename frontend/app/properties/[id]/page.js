
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, User } from 'lucide-react';
import { propertyApi } from '../../../lib/api';
import PropertyFavoriteButton from '../../../components/property/PropertyFavoriteButton';
import PropertyContactForm from '../../../components/property/PropertyContactForm';
import ImageGallery from '../../../components/property/ImageGallery';

const STATUS_BADGE = {
  draft: 'badge-draft',
  published: 'badge-published',
  archived: 'badge-archived',
  disabled: 'badge-disabled',
};

function formatPrice(price) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;

  let property = null;
  try {
    const res = await propertyApi.getOne(id);
    property = res.data?.property || null;
  } catch (err) {
    console.error('[PropertyDetail SSR Error]', err);
  }

  if (!property) {
    return (
      <div className="page text-center py-16">
        <p className="text-ink-500 mb-4">This property could not be found.</p>
        <Link href="/" className="btn-secondary">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [];

  return (
    <div className="page">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> All properties
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
         <ImageGallery images={images} title={property.title} />

          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={
                      STATUS_BADGE[property.status] || 'badge bg-ink-100 text-ink-500'
                    }
                  >
                    {property.status}
                  </span>
                </div>
                <h1 className="text-xl font-semibold text-ink-900 leading-snug">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1.5 mt-2 text-ink-500 text-sm">
                  <MapPin size={13} className="shrink-0" />
                  <span>{property.location}</span>
                </div>
              </div>

              <PropertyFavoriteButton property={property} />
            </div>

            <div className="mt-4 p-4 bg-ink-50 rounded-xl inline-block">
              <p className="text-2xl font-semibold text-ink-900">
                {formatPrice(property.price)}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="section-title mb-2">About this property</h2>
              <p className="text-ink-600 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              {property.owner && (
                <div className="flex items-center gap-2 text-ink-500">
                  <User size={14} />
                  <span>
                    Listed by <span className="text-ink-700">{property.owner.email}</span>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-ink-500">
                <Calendar size={14} />
                <span>
                  {new Date(property.createdAt).toLocaleDateString('en-ET', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <PropertyContactForm propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}