import api from './axios';
import type { MappingItem, LatestPricesResponse, AvgPricesResponse } from '@/types/osrs';

export const mappingQuery = {
  queryKey: ['osrs-mapping'] as const,
  queryFn: () =>
    api
      .get<MappingItem[]>('https://prices.runescape.wiki/api/v1/osrs/mapping')
      .then((res) => res.data),
  staleTime: Infinity,
};

export const latestPricesQuery = {
  queryKey: ['osrs-latest'] as const,
  queryFn: () =>
    api
      .get<LatestPricesResponse>('https://prices.runescape.wiki/api/v1/osrs/latest')
      .then((res) => res.data),
  staleTime: 60_000,
};

export const fiveMinPricesQuery = {
  queryKey: ['osrs-5m'] as const,
  queryFn: () =>
    api
      .get<AvgPricesResponse>('https://prices.runescape.wiki/api/v1/osrs/5m')
      .then((res) => res.data),
  staleTime: 5 * 60_000,
};

export const oneHourPricesQuery = {
  queryKey: ['osrs-1h'] as const,
  queryFn: () =>
    api
      .get<AvgPricesResponse>('https://prices.runescape.wiki/api/v1/osrs/1h')
      .then((res) => res.data),
  staleTime: 60 * 60_000,
};
