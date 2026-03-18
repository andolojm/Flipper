import { Link } from 'react-router';
import { navLinks } from '@/lib/navLinks';

export default function Home() {
  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-4xl font-semibold mb-1 text-violet-600 dark:text-violet-400">Flipperino</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-10">
        Grand Exchange hijinks for Old School RuneScape.
      </p>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Hijinks</h3>
      <ul className="space-y-3">
        {navLinks.map(({ to, label, description }) => (
          <li key={to}>
            <Link to={to} className="group block rounded-md border border-border px-4 py-3 hover:border-violet-500/50 hover:bg-muted/40 transition-colors">
              <div className="font-medium text-violet-600 dark:text-violet-400 group-hover:underline decoration-violet-400 underline-offset-4">{label}</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
