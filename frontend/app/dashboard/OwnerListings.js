'use client';

import { Trash2, Archive, Plus ,Home} from 'lucide-react';
import PropertyCard from '../../components/property/PropertyCard';
import { EmptyState, SkeletonCard, Pagination } from '../../components/ui';
import EditPropertyForm from './EditPropertyForm';

export default function OwnerListings({
  properties,
  loading,
  pagination,
  editingId,
  setEditingId,
  propPage,
  onPublish,
  onArchive,
  onDelete,
  onPageChange,
  onAddNew,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<Home className="w-10 h-10 text-gray-400 stroke-[1.5]" />}
        title="No listings yet"
        body="Create your first property listing to get started."
        action={
          <button onClick={onAddNew} className="btn-primary gap-2">
            <Plus size={14} /> Add listing
          </button>
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((p) => (
          <div key={p.id}>
            <PropertyCard
              property={p}
              showStatus
              footer={
                <div className="flex gap-1.5 flex-wrap">
                  {p.status === 'draft' && (
                    <button onClick={() => onPublish(p.id)} className="btn-primary btn-sm">
                      Publish
                    </button>
                  )}
                  {p.status === 'published' && (
                    <button onClick={() => onArchive(p.id)} className="btn-secondary btn-sm gap-1">
                      <Archive size={11} /> Archive
                    </button>
                  )}
                  {p.status === 'draft' && (
                    <button
                      onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                      className="btn-secondary btn-sm"
                    >
                      {editingId === p.id ? 'Close' : 'Edit'}
                    </button>
                  )}
                  <button onClick={() => onDelete(p.id)} className="btn-danger btn-sm gap-1">
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              }
            />
            {editingId === p.id && (
              <EditPropertyForm
                property={p}
                onSuccess={() => {
                  setEditingId(null);
                  onPageChange(propPage);
                }}
                onCancel={() => setEditingId(null)}
              />
            )}
          </div>
        ))}
      </div>
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </>
  );
}