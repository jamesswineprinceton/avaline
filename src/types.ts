export type PriceRow = {
  vendor: string;
  quantity: number;
  price: number;
  timestamp: string;
};

export type PriceMetrics = {
  points: PriceRow[];
  current: number | null;
  delta24h: number | null;
  low7d: number | null;
  avg_qty7d: number | null;
};

export type AvalineResponse = {
  reply: string;
  current: number | null;
  delta24h: number | null;
  low7d: number | null;
  avg_qty7d: number | null;
};

export type AvalineRequest = {
  question?: string;
}; 