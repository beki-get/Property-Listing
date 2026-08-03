'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Heart, LayoutDashboard, Shield, LogOut, Menu, X, MessageSquare } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useFavoritesStore from '../../store/favoritesStore';

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { user, clearAuth, isAdmin, isOwner } = useAuthStore();
  const { reset: resetFavorites, favoriteIds } = useFavoritesStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleLogout() {
    clearAuth();
    resetFavorites();
    setOpen(false);
    router.push('/');
  }

  const isActive = (href) => pathname === href;

  const navLink = (href, label, Icon) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded transition-colors ${
        isActive(href)
          ? 'bg-forest-900 text-white'
          : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </Link>
  );

  const owner = isOwner?.();
  const admin = isAdmin?.();
  const isBuyer = user && !owner && !admin; 

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-ink-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <div className="w-7 h-7 bg-forest-900 rounded flex items-center justify-center">
            <Home size={14} className="text-white" />
          </div>
          <span className="font-semibold text-ink-900 text-sm tracking-tight leading-none">
            Mela<span className="text-forest-700">Home</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLink('/', 'Properties', null)}

          {isMounted && (
            <>
              {/* Regular Buyers only */}
              {isBuyer && (
                <>
                  {navLink('/inquiries', 'Inquiries', MessageSquare)}
                  {navLink('/favorites', `Saved${favoriteIds?.size > 0 ? ` (${favoriteIds.size})` : ''}`, Heart)}
                </>
              )}

              {/* Property Owners only */}
              {owner && (
                <>
                  {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
                  {navLink('/dashboard?tab=inquiries', 'Inbox', MessageSquare)}
                </>
              )}

              {/* Admin only */}
              {admin && navLink('/admin', 'Admin', Shield)}
            </>
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {!isMounted ? (
            <div className="h-8 w-32 bg-ink-100 animate-pulse rounded" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-500 max-w-[140px] truncate">
                {user.email}
                <span className={`ml-1.5 badge ${
                  admin ? 'bg-forest-900 text-white' :
                  owner ? 'bg-forest-100 text-forest-800' :
                  'bg-ink-100 text-ink-600'
                }`}>{user.role}</span>
              </span>
              <button onClick={handleLogout} className="btn-ghost btn-sm flex items-center gap-1.5">
                <LogOut size={13} /> Log out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-secondary btn-sm">Log in</Link>
              <Link href="/register" className="btn-primary btn-sm">Create account</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded hover:bg-ink-100 text-ink-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ink-100 bg-white px-4 py-3 space-y-1">
          {navLink('/', 'Properties', null)}
          {isMounted && (
            <>
              {/* Regular Buyers only */}
              {isBuyer && (
                <>
                  {navLink('/inquiries', 'My Inquiries', MessageSquare)}
                  {navLink('/favorites', 'Saved properties', Heart)}
                </>
              )}

              {/* Property Owners only */}
              {owner && (
                <>
                  {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
                  {navLink('/dashboard?tab=inquiries', 'Inbox', MessageSquare)}
                </>
              )}

              {/* Admin only */}
              {admin && navLink('/admin', 'Admin panel', Shield)}
            </>
          )}

          <div className="pt-2 border-t border-ink-100 mt-2">
            {!isMounted ? (
              <div className="h-8 w-full bg-ink-100 animate-pulse rounded" />
            ) : user ? (
              <div>
                <p className="text-xs text-ink-400 px-3 py-1 truncate">{user.email}</p>
                <button onClick={handleLogout} className="btn-ghost btn-sm w-full justify-start mt-1">
                  <LogOut size={13} /> Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="btn-secondary btn-sm flex-1 text-center" onClick={() => setOpen(false)}>Log in</Link>
                <Link href="/register" className="btn-primary btn-sm flex-1 text-center" onClick={() => setOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}