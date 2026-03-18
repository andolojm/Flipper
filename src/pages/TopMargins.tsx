import { useMemo } from 'react';
import { Link } from 'react-router';
import PageHeader from '@/components/PageHeader';
import VolumeLegend from '@/components/VolumeLegend';
import { useSuspenseQuery } from '@tanstack/react-query';
import { mappingQuery, fiveMinPricesQuery } from '@/lib/queries';
import type { MappingItem, AvgPricesResponse } from '@/types/osrs';

function rowBg(volume: number, p45: number, p75: number, maxVol: number) {
  if (volume <= p45 && p45 > 0) {
    const alpha = ((1 - volume / p45) * 0.3).toFixed(3);
    return { backgroundColor: `rgba(239, 68, 68, ${alpha})` };
  }
  if (volume > p45) {
    const range = maxVol - p45;
    const alpha = (Math.min(range > 0 ? (volume - p45) / (p75 - p45) : 1, 1) * 0.3).toFixed(3);
    return { backgroundColor: `rgba(34, 197, 94, ${alpha})` };
  }
  return {};
}

export default function TopMargins() {
  const { data: mapping } = useSuspenseQuery<MappingItem[]>(mappingQuery);
  const { data: fiveMin } = useSuspenseQuery<AvgPricesResponse>(fiveMinPricesQuery);

  const top50 = useMemo(() => {

    return mapping
      .flatMap((item) => {
        const price = fiveMin.data[String(item.id)];
        if (price?.avgHighPrice == null || price?.avgLowPrice == null || price.avgHighPrice === 0) return [];
        const margin = price.avgHighPrice - price.avgLowPrice;
        const marginPct = (margin / ((price.avgHighPrice + price.avgLowPrice) / 2)) * 100;
        const volume = (price.highPriceVolume ?? 0) + (price.lowPriceVolume ?? 0);
        return [{ item, margin, marginPct, avgHighPrice: price.avgHighPrice, avgLowPrice: price.avgLowPrice, volume }];
      })
      .sort((a, b) => b.marginPct - a.marginPct)
      .slice(0, 50);
  }, [mapping, fiveMin]);

  const { p45, p75, maxVol } = useMemo(() => {
    if (top50.length === 0) return { p45: 0, p75: 0, maxVol: 0 };
    const sorted = top50.map((r) => r.volume).sort((a, b) => a - b);
    const n = sorted.length;
    return {
      p45: sorted[Math.floor(0.45 * (n - 1))],
      p75: sorted[Math.floor(0.75 * (n - 1))],
      maxVol: sorted[n - 1],
    };
  }, [top50]);

  return (
    <div className="p-6">
      <PageHeader
        title="Top Margins"
        subtitle="Top 50 items by 5-minute average buy/sell spread."
        legend={<VolumeLegend pivot="45th percentile" />}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-violet-600 dark:text-violet-400">
              <th className="pb-2 pl-4 pr-4 sm:pr-8 font-medium">#</th>
              <th className="pb-2 pr-4 sm:pr-8 font-medium">Item</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Avg Buy</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Avg Sell</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium text-right">Margin</th>
              <th className="pb-2 pr-4 font-medium text-right">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {top50.map(({ item, margin, marginPct, avgHighPrice, avgLowPrice, volume }, i) => (
              <tr
                key={item.id}
                style={rowBg(volume, p45, p75, maxVol)}
                className="border-b border-border/50 hover:bg-muted/40 transition-colors"
              >
                <td className="py-2 pl-4 pr-4 sm:pr-8 text-muted-foreground">{i + 1}</td>
                <td className="py-2 pr-4 sm:pr-8">
                  <Link to={`/item/${item.id}`} className="hover:underline">
                    {item.name}
                  </Link>
                </td>
                <td className="hidden sm:table-cell py-2 pr-8 text-right">{avgHighPrice.toLocaleString()} gp</td>
                <td className="hidden sm:table-cell py-2 pr-8 text-right">{avgLowPrice.toLocaleString()} gp</td>
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
