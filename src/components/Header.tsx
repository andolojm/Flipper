import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, Moon, Sun, X } from 'lucide-react';
import ItemSearch from '@/components/ItemSearch';
import { useTheme } from '@/hooks/useTheme';
import type { MappingItem } from '@/types/osrs';
import { navLinks } from '@/lib/navLinks';

interface HeaderProps {
  items: MappingItem[];
  onSelect?: (item: MappingItem) => void;
}

export default function Header({ items, onSelect }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();

  function handleSelect(item: MappingItem) {
    setMenuOpen(false);
    onSelect?.(item);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 h-14 bg-zinc-900/90 dark:bg-zinc-800/90 backdrop-blur-sm border-b border-border">
        {/* Logo */}
        <Link to="/" aria-label="Flipperino home" className="shrink-0">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-7 w-7" />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-1 text-sm ml-4">
          {navLinks.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={[
                  'px-2.5 py-1 rounded-md transition-colors',
                  'text-violet-400 hover:text-violet-300',
                  'hover:bg-zinc-700/50 active:bg-zinc-600/60',
                  active ? 'underline decoration-violet-400 underline-offset-4' : '',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <ItemSearch items={items} onSelect={handleSelect} className="w-36 sm:w-72" />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-zinc-700/50 active:bg-zinc-600/60 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark'
            ? <Sun className="size-4" aria-hidden="true" />
            : <Moon className="size-4" aria-hidden="true" />}
        </button>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </header>

      {/* Mobile nav dropdown */}
      <nav
        id="mobile-nav"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
        className={[
          'fixed top-14 left-0 right-0 z-40 sm:hidden bg-zinc-900/95 dark:bg-zinc-800/95 backdrop-blur-sm border-b border-border',
          menuOpen ? 'block' : 'hidden',
        ].join(' ')}
      >
        {navLinks.map(({ to, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={[
                'block px-4 py-3 text-sm transition-colors',
                'text-violet-400 hover:text-violet-300',
                'hover:bg-zinc-700/50 active:bg-zinc-600/60',
                active ? 'underline decoration-violet-400 underline-offset-4' : '',
              ].join(' ')}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
