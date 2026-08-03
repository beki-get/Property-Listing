import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page min-h-[60vh] flex flex-col items-center justify-center text-center">
      <p className="text-6xl font-serif italic text-ink-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-ink-900 mb-1">Page not found</h1>
      <p className="text-ink-500 text-sm mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">Back to listings</Link>
    </div>
  );
}
