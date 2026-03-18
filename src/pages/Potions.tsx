import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import VolumeLegend from '@/components/VolumeLegend';
import { useSuspenseQuery } from '@tanstack/react-query';
import { latestPricesQuery, fiveMinPricesQuery } from '@/lib/queries';
import type { LatestPricesResponse, AvgPricesResponse } from '@/types/osrs';
import { POTIONS } from '@/data/potions';

const DOSES = [1, 2, 3, 4] as const;

function cellBg(value: number, mean: number, min: number, max: number): React.CSSProperties {
  if (value < mean && mean > min) {
    const alpha = (Math.sqrt((mean - value) / (mean - min)) * 0.2).toFixed(3);
    return { backgroundColor: `rgba(239, 68, 68, ${alpha})` };
  }
  if (value > mean && max > mean) {
    const alpha = (Math.sqrt((value - mean) / (max - mean)) * 0.2).toFixed(3);
    return { backgroundColor: `rgba(34, 197, 94, ${alpha})` };
  }
  return {};
}

// Log-scale wrapper: spreads low values apart for better colour fidelity
function doseCellBg(volume: number, logMean: number, logMin: number, logMax: number): React.CSSProperties {
  return cellBg(Math.log1p(volume), logMean, logMin, logMax);
}

export default function Potions() {
  const { data: latest } = useSuspenseQuery<LatestPricesResponse>(latestPricesQuery);
  const { data: fiveMin } = useSuspenseQuery<AvgPricesResponse>(fiveMinPricesQuery);

  const rows = useMemo(() => {
    return POTIONS.map((potion) => {
      const prices: Partial<Record<1 | 2 | 3 | 4, number>> = {};
      let totalVolume = 0;
      let doseCount = 0;

      const doseVolumes: Partial<Record<1 | 2 | 3 | 4, number>> = {};

      for (const dose of DOSES) {
        const id = potion.doses[dose];
        if (id != null) {
          const p = latest.data[String(id)];
          if (p?.high != null) prices[dose] = p.high;
          const vol = fiveMin.data[String(id)];
          const v = (vol?.highPriceVolume ?? 0) + (vol?.lowPriceVolume ?? 0);
          doseVolumes[dose] = v;
          totalVolume += v;
          doseCount++;
        }
      }

      // Price-per-dose indicators: compare each dose's ppd against the mean ppd
      const ppds = DOSES.flatMap((d) => prices[d] != null ? [{ dose: d, ppd: prices[d]! / d }] : []);
      const meanPpd = ppds.length > 0 ? ppds.reduce((s, x) => s + x.ppd, 0) / ppds.length : 0;
      const indicators: Partial<Record<1 | 2 | 3 | 4, string>> = {};
      for (const { dose, ppd } of ppds) {
        const ratio = meanPpd > 0 ? ppd / meanPpd : 1;
        if (ratio > 1.30) indicators[dose] = '🗑️🗑️🗑️';
        else if (ratio > 1.15) indicators[dose] = '🗑️🗑️';
        else if (ratio > 1.05) indicators[dose] = '🗑️';
        else if (ratio < 0.70) indicators[dose] = '🔥🔥🔥';
        else if (ratio < 0.85) indicators[dose] = '🔥🔥';
        else if (ratio < 0.95) indicators[dose] = '🔥';
      }

      const avgVolume = doseCount > 0 ? totalVolume / doseCount : 0;
      return { potion, prices, indicators, doseVolumes, avgVolume };
    });
  }, [latest, fiveMin]);

  const { nameMean, nameMin, nameMax, logDoseMean, logDoseMin, logDoseMax } = useMemo(() => {
    const avgVols = rows.map((r) => r.avgVolume);
    const logDoseVols = rows.flatMap((r) => Object.values(r.doseVolumes)).map(Math.log1p);
    return {
      nameMean: avgVols.reduce((a, b) => a + b, 0) / avgVols.length,
      nameMin: Math.min(...avgVols),
      nameMax: Math.max(...avgVols),
      logDoseMean: logDoseVols.reduce((a, b) => a + b, 0) / logDoseVols.length,
      logDoseMin: Math.min(...logDoseVols),
      logDoseMax: Math.max(...logDoseVols),
    };
  }, [rows]);

  return (
    <div className="p-6">
      <PageHeader
        title="Potions"
        subtitle="Latest GE prices for each dose of every tradeable potion. Decant via Bob Barter at the Grand Exchange."
        legend={<VolumeLegend pivot="mean" showDoseEmojis />}
      />

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
            {rows.map(({ potion, prices, indicators, doseVolumes, avgVolume }) => (
              <tr key={potion.name} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                <td
                  className="py-2 pl-4 pr-8"
                  style={cellBg(avgVolume, nameMean, nameMin, nameMax)}
                >
                  {potion.name}
                </td>
                {DOSES.map((d) => (
                  <td key={d} className="py-2 pr-6 text-right tabular-nums"
                    style={doseVolumes[d] != null ? doseCellBg(doseVolumes[d]!, logDoseMean, logDoseMin, logDoseMax) : undefined}
                  >
                    {prices[d] != null ? (
                      <span className="inline-flex items-center justify-end gap-1">
                        {indicators[d] && <span>{indicators[d]}</span>}
                        {prices[d]!.toLocaleString()} gp
                      </span>
                    ) : '—'}
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
