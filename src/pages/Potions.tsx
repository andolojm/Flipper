import { useMemo } from 'react';
import BackButton from '@/components/BackButton';
import VolumeLegend from '@/components/VolumeLegend';
import { useSuspenseQuery } from '@tanstack/react-query';
import { latestPricesQuery, fiveMinPricesQuery } from '@/lib/queries';
import type { LatestPricesResponse, AvgPricesResponse } from '@/types/osrs';
import { POTIONS } from '@/data/potions';

const DOSES = [1, 2, 3, 4] as const;

function nameCellBg(volume: number, mean: number, minVol: number, maxVol: number): React.CSSProperties {
  if (volume < mean && mean > minVol) {
    const alpha = (Math.sqrt((mean - volume) / (mean - minVol)) * 0.2).toFixed(3);
    return { backgroundColor: `rgba(239, 68, 68, ${alpha})` };
  }
  if (volume > mean && maxVol > mean) {
    const alpha = (Math.sqrt((volume - mean) / (maxVol - mean)) * 0.2).toFixed(3);
    return { backgroundColor: `rgba(34, 197, 94, ${alpha})` };
  }
  return {};
}

export default function Potions() {
  const { data: latest } = useSuspenseQuery<LatestPricesResponse>(latestPricesQuery);
  const { data: fiveMin } = useSuspenseQuery<AvgPricesResponse>(fiveMinPricesQuery);

  const rows = useMemo(() => {
    return POTIONS.map((potion) => {
      const prices: Partial<Record<1 | 2 | 3 | 4, number>> = {};
      let totalVolume = 0;
      let doseCount = 0;

      for (const dose of DOSES) {
        const id = potion.doses[dose];
        if (id != null) {
          const p = latest.data[String(id)];
          if (p?.high != null) prices[dose] = p.high;
          const vol = fiveMin.data[String(id)];
          totalVolume += (vol?.highPriceVolume ?? 0) + (vol?.lowPriceVolume ?? 0);
          doseCount++;
        }
      }

      const avgVolume = doseCount > 0 ? totalVolume / doseCount : 0;
      return { potion, prices, avgVolume };
    });
  }, [latest, fiveMin]);

  const { mean, minVol, maxVol } = useMemo(() => {
    const volumes = rows.map((r) => r.avgVolume);
    return {
      mean: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      minVol: Math.min(...volumes),
      maxVol: Math.max(...volumes),
    };
  }, [rows]);

  return (
    <div className="p-6">
      <div className="flex items-stretch gap-3 mb-1">
        <BackButton />
        <h2 className="text-4xl font-semibold text-violet-600 dark:text-violet-400">Potions</h2>
        <div className="flex-1" />
        <VolumeLegend pivot="mean" />
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
            {rows.map(({ potion, prices, avgVolume }) => (
              <tr key={potion.name} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                <td
                  className="py-2 pl-4 pr-8"
                  style={nameCellBg(avgVolume, mean, minVol, maxVol)}
                >
                  {potion.name}
                </td>
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
