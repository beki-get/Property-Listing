'use client';
import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { propertyApi, friendlyError } from '../../lib/api';
import { ErrorMessage, Spinner } from '../../components/ui';

export default function CreatePropertyForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    images: [],
  });
  const [imageInput, setImageInput] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  function addImage() {
    const url = imageInput.trim();
    if (!url) return;
    // Basic URL check
    try { new URL(url); }
    catch { setError('Please enter a valid image URL (must start with http:// or https://).'); return; }
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setImageInput('');
    setError('');
  }

  function removeImage(i) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await propertyApi.create({
        ...form,
        price: Number(form.price),
      });
      onSuccess();
    } catch (err) {
      console.error('[CreateProperty]', err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">New property listing</h2>
        <button onClick={onCancel} className="btn-ghost p-1.5 rounded">
          <X size={16} />
        </button>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="space-y-4 mt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="input-label" htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              className="input"
              placeholder="e.g. Spacious 3-bedroom apartment in Bole"
              value={form.title}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={120}
            />
          </div>

          <div className="md:col-span-2">
            <label className="input-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="input resize-none"
              rows={4}
              placeholder="Describe the property — features, condition, nearby landmarks..."
              value={form.description}
              onChange={handleChange}
              required
              minLength={10}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              className="input"
              placeholder="e.g. Bole, Addis Ababa"
              value={form.location}
              onChange={handleChange}
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="price">Price (ETB)</label>
            <input
              id="price"
              name="price"
              type="number"
              className="input"
              placeholder="e.g. 2500000"
              value={form.price}
              onChange={handleChange}
              required
              min={1}
            />
          </div>
        </div>

        {/* Image URLs */}
        <div>
          <label className="input-label">Images (optional)</label>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Paste an image URL..."
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            />
            <button type="button" onClick={addImage} className="btn-secondary gap-1 shrink-0">
              <Plus size={14} /> Add
            </button>
          </div>
          <p className="text-xs text-ink-400 mt-1">
            Paste a direct image URL and click Add. You need at least 1 image to publish.
          </p>
          {form.images.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {form.images.map((url, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-ink-50 rounded text-xs text-ink-600">
                  <span className="flex-1 truncate">{url}</span>
                  <button type="button" onClick={() => removeImage(i)} className="text-ink-400 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary gap-2">
            {loading ? <Spinner size={14} className="text-white" /> : null}
            {loading ? 'Saving...' : 'Save as draft'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
