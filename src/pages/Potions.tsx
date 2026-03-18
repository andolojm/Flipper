import { useMemo } from 'react';
import BackButton from '@/components/BackButton';
import { useSuspenseQuery } from '@tanstack/react-query';
import { latestPricesQuery } from '@/lib/queries';
import type { LatestPricesResponse } from '@/types/osrs';
import { POTIONS } from '@/data/potions';

const DOSES = [1, 2, 3, 4] as const;

export default function Potions() {
  const { data: latest } = useSuspenseQuery<LatestPricesResponse>(latestPricesQuery);

  const rows = useMemo(() => {
    return POTIONS.map((potion) => {
      const prices: Partial<Record<1 | 2 | 3 | 4, number>> = {};
      for (const dose of DOSES) {
        const id = potion.doses[dose];
        if (id != null) {
          const p = latest.data[String(id)];
          if (p?.high != null) prices[dose] = p.high;
        }
      }
      return { potion, prices };
    });
  }, [latest]);

  return (
    <div className="p-6">
      <div className="flex items-stretch gap-3 mb-1">
        <BackButton />
        <h2 className="text-4xl font-semibold text-violet-600 dark:text-violet-400">Potions</h2>
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 mb-10">
        Latest GE prices for each dose of every tradeable potion. Decant via Bob Barter at the Grand Exchange.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-violet-600 dark:text-violet-400">
              <th className="pb-2 pl-4 pr-8 font-medium">Potion</th>
              {DOSES.map((d) => (
                <th key={d} className="pb-2 pr-6 font-medium text-right">{d}-dose</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ potion, prices }) => (
              <tr key={potion.name} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                <td className="py-2 pl-4 pr-8">{potion.name}</td>
                {DOSES.map((d) => (
                  <td key={d} className="py-2 pr-6 text-right tabular-nums">
                    {prices[d] != null ? `${prices[d]!.toLocaleString()} gp` : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
