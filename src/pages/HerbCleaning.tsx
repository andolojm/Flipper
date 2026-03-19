import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { mappingQuery, latestPricesQuery, oneHourPricesQuery } from '@/lib/queries';
import type { MappingItem, LatestPricesResponse, AvgPricesResponse } from '@/types/osrs';
import PageHeader from '@/components/PageHeader';
import VolumeLegend from '@/components/VolumeLegend';

const ZAHUR_COST = 200;

function rowBg(volume: number, mean: number, minVol: number, maxVol: number): React.CSSProperties {
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

type HerbRow = {
  grimyItem: MappingItem;
  cleanItem: MappingItem;
  grimyLow: number;
  cleanHigh: number;
  manualMargin: number;
  manualMarginPct: number;
  zahurMargin: number;
  zahurMarginPct: number;
  volume: number;
};

export default function HerbCleaning() {
  const { data: mapping } = useSuspenseQuery<MappingItem[]>(mappingQuery);
  const { data: latest } = useSuspenseQuery<LatestPricesResponse>(latestPricesQuery);
  const { data: oneHour } = useSuspenseQuery<AvgPricesResponse>(oneHourPricesQuery);

  const rows = useMemo((): HerbRow[] => {
    const nameToItem = new Map(mapping.map((item) => [item.name, item]));

    return mapping.flatMap((grimyItem): HerbRow[] => {
      if (!grimyItem.name.startsWith('Grimy ')) return [];

      const suffix = grimyItem.name.slice('Grimy '.length);
      const cleanName = suffix.charAt(0).toUpperCase() + suffix.slice(1);
      const cleanItem = nameToItem.get(cleanName);
      if (!cleanItem) return [];

      const grimyLow = latest.data[String(grimyItem.id)]?.low;
      const cleanHigh = latest.data[String(cleanItem.id)]?.high;
      if (grimyLow == null || cleanHigh == null) return [];

      const manualMargin = cleanHigh - grimyLow;
      const manualMarginPct = (manualMargin / grimyLow) * 100;
      const zahurMargin = manualMargin - ZAHUR_COST;
      const zahurMarginPct = (zahurMargin / (grimyLow + ZAHUR_COST)) * 100;

      const h1 = oneHour.data[String(grimyItem.id)];
      const volume = (h1?.highPriceVolume ?? 0) + (h1?.lowPriceVolume ?? 0);

      return [{ grimyItem, cleanItem, grimyLow, cleanHigh, manualMargin, manualMarginPct, zahurMargin, zahurMarginPct, volume }];
    }).sort((a, b) => b.manualMargin - a.manualMargin);
  }, [mapping, latest, oneHour]);

  const { mean, minVol, maxVol } = useMemo(() => {
    if (rows.length === 0) return { mean: 0, minVol: 0, maxVol: 0 };
    const vols = rows.map((r) => r.volume);
    return { mean: vols.reduce((a, b) => a + b, 0) / vols.length, minVol: Math.min(...vols), maxVol: Math.max(...vols) };
  }, [rows]);

  return (
    <div className="p-6">
      <PageHeader
        title="Herb Cleaning"
        subtitle="Margins for cleaning grimy herbs. Zahur column factors in the 200gp per herb cost to clean via NPC. Row color indicates 1h grimy herb trade volume."
        legend={<VolumeLegend pivot="mean" />}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-violet-600 dark:text-violet-400">
              <th className="pb-2 pl-4 pr-8 font-medium">Herb</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Grimy (buy)</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Clean (sell)</th>
              <th className="pb-2 pr-8 font-medium text-right">Manual margin</th>
              <th className="pb-2 pr-4 font-medium text-right">Manual %</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Zahur margin</th>
              <th className="pb-2 pr-4 font-medium text-right">Zahur %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ grimyItem, cleanItem, grimyLow, cleanHigh, manualMargin, manualMarginPct, zahurMargin, zahurMarginPct, volume }) => (
              <tr
                key={grimyItem.id}
                style={rowBg(volume, mean, minVol, maxVol)}
                className="border-b border-border/50 hover:bg-muted/40 transition-colors"
              >
                <td className="py-2 pl-4 pr-8">
                  <a
                    href={`https://oldschool.runescape.wiki/w/${encodeURIComponent(cleanItem.name.replace(/ /g, '_'))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {cleanItem.name}
                  </a>
                </td>
                <td className="hidden sm:table-cell py-2 pr-8 text-right tabular-nums">
                  {grimyLow.toLocaleString()} gp
                </td>
                <td className="hidden sm:table-cell py-2 pr-8 text-right tabular-nums">
                  {cleanHigh.toLocaleString()} gp
                </td>
                <td className="py-2 pr-8 text-right tabular-nums font-medium">
                  {manualMargin.toLocaleString()} gp
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-muted-foreground">
                  {manualMarginPct.toFixed(2)}%
                </td>
                <td className="hidden sm:table-cell py-2 pr-8 text-right tabular-nums font-medium">
                  {zahurMargin.toLocaleString()} gp
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-muted-foreground">
                  {zahurMarginPct.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
