import { useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import VolumeLegend from '@/components/VolumeLegend';
import ChipList from '@/components/ChipList';
import { useSuspenseQuery } from '@tanstack/react-query';
import { mappingQuery, latestPricesQuery, fiveMinPricesQuery, oneHourPricesQuery } from '@/lib/queries';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { MappingItem, AvgPricesResponse, LatestPricesResponse } from '@/types/osrs';

const NATURE_RUNE_ID = 561;

type Filter = 'all' | 'has-1h' | 'has-5m' | 'top-25pct';

const FILTER_OPTIONS: { label: string; value: Filter }[] = [
  { label: 'All items', value: 'all' },
  { label: 'Has 1h buy', value: 'has-1h' },
  { label: 'Has 5m buy', value: 'has-5m' },
  { label: 'Top 25% volume', value: 'top-25pct' },
];

function rowBg(volume: number, mean: number, minVol: number, maxVol: number) {
  if (volume < mean && mean > minVol) {
    const alpha = (((mean - volume) / (mean - minVol)) * 0.3).toFixed(3);
    return { backgroundColor: `rgba(239, 68, 68, ${alpha})` };
  }
  if (volume > mean && maxVol > mean) {
    const alpha = (((volume - mean) / (maxVol - mean)) * 0.3).toFixed(3);
    return { backgroundColor: `rgba(34, 197, 94, ${alpha})` };
  }
  return {};
}

type AlchemyRow = {
  item: MappingItem;
  gePrice: number;
  alchValue: number;
  margin: number;
  marginPct: number;
  volume: number;
  avg5m: number | null;
  avg1h: number | null;
};

export default function Alchemy() {
  const { data: mapping } = useSuspenseQuery<MappingItem[]>(mappingQuery);
  const { data: latest } = useSuspenseQuery<LatestPricesResponse>(latestPricesQuery);
  const { data: fiveMin } = useSuspenseQuery<AvgPricesResponse>(fiveMinPricesQuery);
  const { data: oneHour } = useSuspenseQuery<AvgPricesResponse>(oneHourPricesQuery);

  const [filter, setFilter] = useState<Filter>('all');

  const natureRunePrice = useMemo(() => {
    return latest.data[String(NATURE_RUNE_ID)]?.high ?? null;
  }, [latest]);

  // All profitable alchemy rows before filtering
  const allRows = useMemo((): AlchemyRow[] => {
    if (natureRunePrice == null) return [];

    return mapping
      .flatMap((item): AlchemyRow[] => {
        if (!item.highalch) return [];
        const latestPrice = latest.data[String(item.id)]?.high;
        if (latestPrice == null) return [];
        const margin = item.highalch - latestPrice - natureRunePrice;
        if (margin <= 0) return [];
        const marginPct = (margin / item.highalch) * 100;
        const p5m = fiveMin.data[String(item.id)];
        const p1h = oneHour.data[String(item.id)];
        const volume = (p5m?.highPriceVolume ?? 0) + (p5m?.lowPriceVolume ?? 0);
        return [{ item, gePrice: latestPrice, alchValue: item.highalch, margin, marginPct, volume,
          avg5m: p5m?.avgHighPrice ?? null,
          avg1h: p1h?.avgHighPrice ?? null,
        }];
      })
      .sort((a, b) => b.marginPct - a.marginPct);
  }, [mapping, latest, fiveMin, oneHour, natureRunePrice]);

  const top50 = useMemo((): AlchemyRow[] => {
    let rows = allRows;

    if (filter === 'has-1h') {
      rows = rows.filter((r) => oneHour.data[String(r.item.id)]?.avgHighPrice != null);
    } else if (filter === 'has-5m') {
      rows = rows.filter((r) => fiveMin.data[String(r.item.id)]?.avgHighPrice != null);
    } else if (filter === 'top-25pct') {
      const volumes = allRows.map((r) => r.volume).sort((a, b) => a - b);
      const p75 = volumes[Math.floor(volumes.length * 0.75)];
      rows = rows.filter((r) => r.volume >= p75);
    }

    return rows.slice(0, 50);
  }, [allRows, filter, fiveMin, oneHour]);

  const { mean, minVol, maxVol } = useMemo(() => {
    if (top50.length === 0) return { mean: 0, minVol: 0, maxVol: 0 };
    const volumes = top50.map((r) => r.volume);
    return {
      mean: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      minVol: Math.min(...volumes),
      maxVol: Math.max(...volumes),
    };
  }, [top50]);

  return (
    <div className="p-6">
      <PageHeader
        title="Alchemy"
        subtitle="Top 50 items by High Alchemy profit. Nature rune cost included."
        legend={<VolumeLegend pivot="mean" />}
        chips={<ChipList options={FILTER_OPTIONS} value={filter} onChange={setFilter} />}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-violet-600 dark:text-violet-400">
              <th className="pb-2 pl-4 pr-4 sm:pr-8 font-medium">#</th>
              <th className="pb-2 pr-4 sm:pr-8 font-medium">Item</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">GE Price</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Alch Value</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Margin</th>
              <th className="pb-2 pr-4 font-medium text-right">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {top50.map(({ item, gePrice, alchValue, margin, marginPct, volume, avg5m, avg1h }, i) => (
              <tr
                key={item.id}
                style={rowBg(volume, mean, minVol, maxVol)}
                className="border-b border-border/50 hover:bg-muted/40 transition-colors"
              >
                <td className="py-2 pl-4 pr-4 sm:pr-8 text-muted-foreground">{i + 1}</td>
                <td className="py-2 pr-4 sm:pr-8">
                  <a
                    href={`https://oldschool.runescape.wiki/w/${encodeURIComponent(item.name.replace(/ /g, '_'))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {item.name}
                  </a>
                </td>
                <td className="hidden sm:table-cell py-2 pr-8 text-right">
                  <Tooltip>
                    <TooltipTrigger className="w-full text-right cursor-help underline decoration-dotted underline-offset-2">
                      {gePrice.toLocaleString()} gp
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">5m avg buy</span>
                          <span className="font-medium tabular-nums">{avg5m?.toLocaleString() ?? '—'} gp</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">1h avg buy</span>
                          <span className="font-medium tabular-nums">{avg1h?.toLocaleString() ?? '—'} gp</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="hidden sm:table-cell py-2 pr-8 text-right">{alchValue.toLocaleString()} gp</td>
                <td className="hidden sm:table-cell py-2 pr-8 text-right font-medium">{margin.toLocaleString()} gp</td>
                <td className="py-2 pr-4 text-right text-muted-foreground">{marginPct.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
