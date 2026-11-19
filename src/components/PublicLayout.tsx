import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/format';
import { API_BASE } from '../lib/api';

function ThemeButton() {
  const { resolved, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-line bg-surface/70 p-2 text-muted transition-colors hover:text-ink"
      aria-label="Toggle theme"
    >
      {resolved === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}

export function PublicLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-full bg-canvas">
      <header className="border-b border-line bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/welcome" aria-label="CleanSoc home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { to: '/features', label: 'Features' },
              { to: '/how-it-works', label: 'How it works' },
              { to: '/use-cases', label: 'Use cases' },
              { to: '/faq', label: 'FAQ' },
              { to: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
                  location.pathname === item.to
                    ? 'bg-raised text-ink'
                    : 'text-ink-soft hover:bg-raised hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg p-2 text-muted hover:bg-raised hover:text-ink md:hidden"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <ThemeButton />
            <Link to="/terms" className="hidden text-[12px] text-muted hover:text-ink sm:block">Terms</Link>
            <Button asChild size="sm">
              <a href={API_BASE ? `${API_BASE}/api/auth/x/start` : '/api/auth/x/start'}>Sign in with X</a>
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-line bg-surface/95 px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {[
                { to: '/features', label: 'Features' },
                { to: '/how-it-works', label: 'How it works' },
                { to: '/use-cases', label: 'Use cases' },
                { to: '/faq', label: 'FAQ' },
                { to: '/contact', label: 'Contact' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                    location.pathname === item.to
                      ? 'bg-raised text-ink'
                      : 'text-ink-soft hover:bg-raised hover:text-ink',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-surface/40 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-[12.5px] leading-5 text-muted">
              A calmer way to review and clean up your X account. OAuth-only, encrypted tokens, explicit confirmation.
            </p>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Product</h3>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li><Link to="/features" className="text-ink-soft hover:text-ink">Features</Link></li>
              <li><Link to="/how-it-works" className="text-ink-soft hover:text-ink">How it works</Link></li>
              <li><Link to="/use-cases" className="text-ink-soft hover:text-ink">Use cases</Link></li>
              <li><Link to="/faq" className="text-ink-soft hover:text-ink">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Company</h3>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li><Link to="/contact" className="text-ink-soft hover:text-ink">Contact</Link></li>
              <li><Link to="/terms" className="text-ink-soft hover:text-ink">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-ink-soft hover:text-ink">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Connect</h3>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li><a href={API_BASE ? `${API_BASE}/api/auth/x/start` : '/api/auth/x/start'} className="text-ink-soft hover:text-ink">Sign in with X</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-line px-4 pt-6 text-center text-[11px] text-muted sm:px-6">
          &copy; {new Date().getFullYear()} CleanSoc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
