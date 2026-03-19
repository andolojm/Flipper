import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { latestPricesQuery, oneHourPricesQuery } from '@/lib/queries';
import { POISONABLE_ITEMS, WEAPON_POISON_PP_ID } from '@/data/poisonableItems';
import type { LatestPricesResponse, AvgPricesResponse } from '@/types/osrs';
import PageHeader from '@/components/PageHeader';
import VolumeLegend from '@/components/VolumeLegend';

function cellBg(volume: number, mean: number, minVol: number, maxVol: number): React.CSSProperties {
  if (volume < mean && mean > minVol) {
    const alpha = (Math.sqrt((mean - volume) / (mean - minVol)) * 0.25).toFixed(3);
    return { backgroundColor: `rgba(239, 68, 68, ${alpha})` };
  }
  if (volume > mean && maxVol > mean) {
    const alpha = (Math.sqrt((volume - mean) / (maxVol - mean)) * 0.25).toFixed(3);
    return { backgroundColor: `rgba(34, 197, 94, ${alpha})` };
  }
  return {};
}

export default function Poison() {
  const { data: latest } = useSuspenseQuery<LatestPricesResponse>(latestPricesQuery);
  const { data: oneHour } = useSuspenseQuery<AvgPricesResponse>(oneHourPricesQuery);

  const rows = useMemo(() => {
    const poisonLow = latest.data[String(WEAPON_POISON_PP_ID)]?.low;
    if (poisonLow == null) return [];

    return POISONABLE_ITEMS.flatMap((item) => {
      const baseLow = latest.data[String(item.baseId)]?.low;
      const poisonedHigh = latest.data[String(item.poisonedId)]?.high;
      if (baseLow == null || poisonedHigh == null) return [];

      const poisonCostPerItem = poisonLow / item.quantity;
      const totalCost = baseLow + poisonCostPerItem;
      const profit = poisonedHigh - totalCost;
      const marginPct = (profit / totalCost) * 100;

      const h1Base = oneHour.data[String(item.baseId)];
      const h1Poisoned = oneHour.data[String(item.poisonedId)];
      const baseVolume = (h1Base?.highPriceVolume ?? 0) + (h1Base?.lowPriceVolume ?? 0);
      const poisonedVolume = (h1Poisoned?.highPriceVolume ?? 0) + (h1Poisoned?.lowPriceVolume ?? 0);

      return [{ item, baseLow, poisonedHigh, profit, marginPct, baseVolume, poisonedVolume }];
    }).sort((a, b) => b.marginPct - a.marginPct);
  }, [latest, oneHour]);

  // Separate stats for base and poisoned volumes
  const baseStats = useMemo(() => {
    if (rows.length === 0) return { mean: 0, minVol: 0, maxVol: 0 };
    const vols = rows.map((r) => r.baseVolume);
    return { mean: vols.reduce((a, b) => a + b, 0) / vols.length, minVol: Math.min(...vols), maxVol: Math.max(...vols) };
  }, [rows]);

  const poisonedStats = useMemo(() => {
    if (rows.length === 0) return { mean: 0, minVol: 0, maxVol: 0 };
    const vols = rows.map((r) => r.poisonedVolume);
    return { mean: vols.reduce((a, b) => a + b, 0) / vols.length, minVol: Math.min(...vols), maxVol: Math.max(...vols) };
  }, [rows]);

  return (
    <div className="p-6">
      <PageHeader
        title="Poison"
        subtitle="Profit from poisoning weapons and ammo with Weapon Poison++. Cell color indicates 1h trade volume."
        legend={<VolumeLegend pivot="mean" />}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-violet-600 dark:text-violet-400">
              <th className="pb-2 pl-4 pr-8 font-medium">Item</th>
              <th className="pb-2 pr-8 font-medium text-right">Qty / vial</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Base price</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Poisoned price</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Profit</th>
              <th className="pb-2 pr-4 font-medium text-right">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, baseLow, poisonedHigh, profit, marginPct, baseVolume, poisonedVolume }) => (
              <tr
                key={item.baseId}
                className="border-b border-border/50 hover:bg-muted/40 transition-colors"
              >
                <td className="py-2 pl-4 pr-8">
                  <a
                    href={`https://oldschool.runescape.wiki/w/${encodeURIComponent(item.baseName.replace(/ /g, '_'))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {item.baseName}
                  </a>
                </td>
                <td className="py-2 pr-8 text-right tabular-nums">{item.quantity}</td>
                <td
                  className="hidden sm:table-cell py-2 pr-8 text-right tabular-nums"
                  style={cellBg(baseVolume, baseStats.mean, baseStats.minVol, baseStats.maxVol)}
                >
                  {baseLow.toLocaleString()} gp
                </td>
                <td
                  className="hidden sm:table-cell py-2 pr-8 text-right tabular-nums"
                  style={cellBg(poisonedVolume, poisonedStats.mean, poisonedStats.minVol, poisonedStats.maxVol)}
                >
                  {poisonedHigh.toLocaleString()} gp
                </td>
                <td className="hidden sm:table-cell py-2 pr-8 text-right tabular-nums font-medium">
                  {profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} gp
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-muted-foreground">
                  {marginPct.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
