export interface MappingItem {
  id: number;
  name: string;
  examine: string;
  members: boolean;
  lowalch: number | null;
  highalch: number | null;
  limit: number | null;
  value: number;
  icon: string;
  wiki_name: string;
}

export interface ItemPrice {
  high: number | null;
  highTime: number | null;
  low: number | null;
  lowTime: number | null;
}

export interface LatestPricesResponse {
  data: Record<string, ItemPrice>;
}

export interface ItemAvgPrice {
  avgHighPrice: number | null;
  highPriceVolume: number | null;
  avgLowPrice: number | null;
  lowPriceVolume: number | null;
}

export interface AvgPricesResponse {
  timestamp: number;
  data: Record<string, ItemAvgPrice>;
}
