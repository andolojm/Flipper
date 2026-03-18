import { useMemo } from 'react';
import { Link } from 'react-router';
import BackButton from '@/components/BackButton';
import VolumeLegend from '@/components/VolumeLegend';
import { useSuspenseQuery } from '@tanstack/react-query';
import { latestPricesQuery, mappingQuery, oneHourPricesQuery } from '@/lib/queries';
import type { MappingItem, AvgPricesResponse, LatestPricesResponse } from '@/types/osrs';
import { formatGp } from '@/lib/formatters';
import { ITEM_SET_IDS, ITEM_SETS } from '@/data/itemSets';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// Colors rows by rank (0 = lowest volume, n-1 = highest).
// Bottom 45% → red fading to transparent; top 55% → green intensifying.
function rowBg(rank: number, n: number): React.CSSProperties {
  if (n === 0) return {};
  const p45 = Math.floor(0.45 * (n - 1));
  const p75 = Math.floor(0.75 * (n - 1));
  if (rank <= p45 && p45 > 0) {
    const alpha = ((1 - rank / p45) * 0.3).toFixed(3);
    return { backgroundColor: `rgba(239, 68, 68, ${alpha})` };
  }
  if (rank > p45) {
    const alpha = (Math.min(p75 > p45 ? (rank - p45) / (p75 - p45) : 1, 1) * 0.3).toFixed(3);
    return { backgroundColor: `rgba(34, 197, 94, ${alpha})` };
  }
  return {};
}

export default function ItemSets() {
  const { data: mapping } = useSuspenseQuery<MappingItem[]>(mappingQuery);
  const { data: latestPrices } = useSuspenseQuery<LatestPricesResponse>(latestPricesQuery);
  const { data: oneHour } = useSuspenseQuery<AvgPricesResponse>(oneHourPricesQuery);

  const sets = useMemo(() => {
    return mapping
      .filter((item) => ITEM_SET_IDS.has(item.id))
      .flatMap((item) => {
        const p = latestPrices.data[item.id];
        if (!p?.high || !p?.low) return [];

        const componentIds = ITEM_SETS[item.id] ?? [];
        let compHigh = 0;
        let compLow = 0;
        let allComponentPriced = componentIds.length > 0;
        for (const cid of componentIds) {
          const cp = latestPrices.data[cid];
          if (!cp?.high || !cp?.low) { allComponentPriced = false; break; }
          compHigh += cp.high;
          compLow += cp.low;
        }

        const build = allComponentPriced ? p.high - compLow : null;
        const destroy = allComponentPriced ? p.low - compHigh : null;
        const buildMargin = build != null ? (build / p.high) * 100 : null;
        const destroyMargin = destroy != null ? (destroy / p.low) * 100 : null;

        return [{ item, high: p.high, low: p.low,
          compHigh: allComponentPriced ? compHigh : null,
          compLow: allComponentPriced ? compLow : null,
          build, destroy, buildMargin, destroyMargin }];
      })
      .sort((a, b) => {
        const aMax = Math.max(a.buildMargin ?? -Infinity, a.destroyMargin ?? -Infinity);
        const bMax = Math.max(b.buildMargin ?? -Infinity, b.destroyMargin ?? -Infinity);
        return bMax - aMax;
      });
  }, [mapping, latestPrices]);

  const nameById = useMemo(
    () => new Map(mapping.map((item) => [item.id, item.name])),
    [mapping]
  );

  // Rank each set by combined 1h volume among only the sets in this list.
  const volumeRankById = useMemo(() => {
    const withVolume = sets.map(({ item }) => {
      const p = oneHour.data[String(item.id)];
      const volume = (p?.highPriceVolume ?? 0) + (p?.lowPriceVolume ?? 0);
      return { id: item.id, volume };
    });
    withVolume.sort((a, b) => a.volume - b.volume);
    return new Map(withVolume.map(({ id }, rank) => [id, rank]));
  }, [sets, oneHour]);

  return (
    <div className="p-6">
      <div className="flex items-stretch gap-3 mb-1">
        <BackButton />
        <h2 className="text-4xl font-semibold text-violet-600 dark:text-violet-400">Item Sets</h2>
        <div className="flex-1" />
        <VolumeLegend pivot="45th percentile" />
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 mb-10">
        Best margins for building and destroying item sets, sorted by highest opportunity.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-violet-600 dark:text-violet-400">
              <th className="pb-2 pl-4 pr-8 font-medium">Item</th>
              <th className="pb-2 pr-8 font-medium">Set Price</th>
              <th className="hidden sm:table-cell pb-2 pr-8 font-medium">Component Price</th>
              <th className="pb-2 pr-8 font-medium text-right">Build</th>
              <th className="pb-2 pr-8 font-medium text-right">Build Margin</th>
              <th className="pb-2 pr-8 font-medium text-right">Destroy</th>
              <th className="pb-2 pr-4 font-medium text-right">Destroy Margin</th>
            </tr>
          </thead>
          <tbody>
            {sets.map(({ item, high, low, compHigh, compLow, build, destroy, buildMargin, destroyMargin }) => {
              const rank = volumeRankById.get(item.id) ?? 0;
              return (
                <tr key={item.id} style={rowBg(rank, sets.length)} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                  <td className="py-2 pl-4 pr-8">
                    <Link to={`/item/${item.id}`} className="hover:underline">
                      {item.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-8">{high.toLocaleString()} – {low.toLocaleString()}</td>
                  <td className="hidden sm:table-cell py-2 pr-8">
                    {compHigh != null && compLow != null ? (
                      <Tooltip>
                        <TooltipTrigger className="w-full text-left cursor-help underline decoration-dotted underline-offset-2">
                          {compHigh.toLocaleString()} – {compLow.toLocaleString()}
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-col gap-1">
                            {(ITEM_SETS[item.id] ?? []).map((cid) => {
                              const p = oneHour?.data[String(cid)];
                              return (
                                <div key={cid} className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">{nameById.get(cid) ?? cid}</span>
                                  <span className="font-medium tabular-nums">
                                    {p?.avgHighPrice?.toLocaleString() ?? '—'} – {p?.avgLowPrice?.toLocaleString() ?? '—'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : '—'}
                  </td>
                  <td className="py-2 pr-8 text-right">{build != null ? formatGp(build) : '—'}</td>
                  <td className="py-2 pr-8 text-right">{buildMargin != null ? `${buildMargin.toFixed(2)}%` : '—'}</td>
                  <td className="py-2 pr-8 text-right">{destroy != null ? formatGp(destroy) : '—'}</td>
                  <td className="py-2 pr-4 text-right">{destroyMargin != null ? `${destroyMargin.toFixed(2)}%` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
