import { useParams } from 'react-router';
import BackButton from '@/components/BackButton';
import { useSuspenseQuery } from '@tanstack/react-query';
import { mappingQuery, latestPricesQuery, fiveMinPricesQuery, oneHourPricesQuery } from '@/lib/queries';
import type { MappingItem, LatestPricesResponse, AvgPricesResponse } from '@/types/osrs';
import { formatGp, formatTime } from '@/lib/formatters';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: mapping } = useSuspenseQuery<MappingItem[]>(mappingQuery);
  const { data: latest } = useSuspenseQuery<LatestPricesResponse>(latestPricesQuery);
  const { data: fiveMin } = useSuspenseQuery<AvgPricesResponse>(fiveMinPricesQuery);
  const { data: oneHour } = useSuspenseQuery<AvgPricesResponse>(oneHourPricesQuery);

  const item = mapping?.find((i) => i.id === Number(id));
  const price = latest?.data[String(id)];
  const price5m = fiveMin?.data[String(id)];
  const price1h = oneHour?.data[String(id)];

  if (!item) return null;

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-stretch gap-3 mb-1">
        <BackButton />
        <h2 className="text-2xl font-semibold text-violet-600 dark:text-violet-400">{item.name}</h2>
      </div>
      <p className="text-muted-foreground mb-6">{item.examine}</p>

      <section className="mb-6">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Live Prices
        </h3>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Instant buy</dt>
          <dd>{formatGp(price?.high ?? null)}</dd>
          <dt className="text-muted-foreground">Instant buy time</dt>
          <dd>{formatTime(price?.highTime ?? null)}</dd>
          <dt className="text-muted-foreground">Instant sell</dt>
          <dd>{formatGp(price?.low ?? null)}</dd>
          <dt className="text-muted-foreground">Instant sell time</dt>
          <dd>{formatTime(price?.lowTime ?? null)}</dd>
        </dl>
      </section>

      <section className="mb-6">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          5 Minute Avg
        </h3>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Avg buy</dt>
          <dd>{formatGp(price5m?.avgHighPrice ?? null)}</dd>
          <dt className="text-muted-foreground">Buy volume</dt>
          <dd>{price5m?.highPriceVolume?.toLocaleString() ?? '—'}</dd>
          <dt className="text-muted-foreground">Avg sell</dt>
          <dd>{formatGp(price5m?.avgLowPrice ?? null)}</dd>
          <dt className="text-muted-foreground">Sell volume</dt>
          <dd>{price5m?.lowPriceVolume?.toLocaleString() ?? '—'}</dd>
        </dl>
      </section>

      <section className="mb-6">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          1 Hour Avg
        </h3>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Avg buy</dt>
          <dd>{formatGp(price1h?.avgHighPrice ?? null)}</dd>
          <dt className="text-muted-foreground">Buy volume</dt>
          <dd>{price1h?.highPriceVolume?.toLocaleString() ?? '—'}</dd>
          <dt className="text-muted-foreground">Avg sell</dt>
          <dd>{formatGp(price1h?.avgLowPrice ?? null)}</dd>
          <dt className="text-muted-foreground">Sell volume</dt>
          <dd>{price1h?.lowPriceVolume?.toLocaleString() ?? '—'}</dd>
        </dl>
      </section>

      <section>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Item Info
        </h3>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <dt className="text-muted-foreground">ID</dt>
          <dd>{item.id}</dd>
          <dt className="text-muted-foreground">Store value</dt>
          <dd>{formatGp(item.value)}</dd>
          <dt className="text-muted-foreground">High alch</dt>
          <dd>{formatGp(item.highalch)}</dd>
          <dt className="text-muted-foreground">Low alch</dt>
          <dd>{formatGp(item.lowalch)}</dd>
          <dt className="text-muted-foreground">Buy limit</dt>
          <dd>{item.limit ?? '—'}</dd>
          <dt className="text-muted-foreground">Members</dt>
          <dd>{item.members ? 'Yes' : 'No'}</dd>
        </dl>
      </section>
    </div>
  );
}
