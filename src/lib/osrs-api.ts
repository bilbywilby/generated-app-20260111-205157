export interface ItemMapping {
  id: number;
  name: string;
  examine: string;
  members: boolean;
  lowalch?: number;
  highalch?: number;
  limit?: number;
  value: number;
  icon: string;
}
export interface LatestPrice {
  high: number;
  highTime: number;
  low: number;
  lowTime: number;
}
export interface LatestPricesResponse {
  data: Record<string, LatestPrice>;
}
export interface HourlyPriceData {
  avgHighPrice: number | null;
  avgLowPrice: number | null;
  highPriceVolume: number;
  lowPriceVolume: number;
  timestamp: number;
}
export interface HourlyPricesResponse {
  data: Record<string, HourlyPriceData>;
}
export interface TimeSeriesPoint {
  timestamp: number;
  avgHighPrice: number;
  avgLowPrice: number;
  highPriceVolume: number;
  lowPriceVolume: number;
}
export interface TimeSeriesResponse {
  data: TimeSeriesPoint[];
}
export const NATURE_RUNE_ID = 561;
const BASE_URL = 'https://prices.runescape.wiki/api/v1/osrs';
const USER_AGENT = 'RuneTerminal - Market Analytics Tool';
export async function fetchItemMapping(): Promise<ItemMapping[]> {
  try {
    const response = await fetch(`${BASE_URL}/mapping`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error('Mapping fetch failed');
    return await response.json();
  } catch (error) {
    console.error('fetchItemMapping error:', error);
    return [];
  }
}
export async function fetchLatestPrices(): Promise<Record<string, LatestPrice>> {
  try {
    const response = await fetch(`${BASE_URL}/latest`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error('Latest prices fetch failed');
    const json: LatestPricesResponse = await response.json();
    return json.data || {};
  } catch (error) {
    console.error('fetchLatestPrices error:', error);
    return {};
  }
}
export async function fetch1hPrices(): Promise<Record<string, HourlyPriceData>> {
  try {
    const response = await fetch(`${BASE_URL}/1h`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error('1h prices fetch failed');
    const json: HourlyPricesResponse = await response.json();
    return json.data || {};
  } catch (error) {
    console.error('fetch1hPrices error:', error);
    return {};
  }
}
export async function fetchTimeSeries(id: number, timestep: '5m' | '1h' | '6h' = '1h'): Promise<TimeSeriesPoint[]> {
  try {
    const response = await fetch(`${BASE_URL}/timeseries?timestep=${timestep}&id=${id}`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error('Timeseries fetch failed');
    const json: TimeSeriesResponse = await response.json();
    return json.data || [];
  } catch (error) {
    console.error('fetchTimeSeries error:', error);
    return [];
  }
}
export function calculateMargin(high: number, low: number) {
  if (!high || !low || high <= 0 || low <= 0) {
    return { profit: 0, tax: 0, roi: 0 };
  }
  // 2% GE Tax (December 2021 Update)
  const tax = Math.floor(high * 0.02);
  const cappedTax = Math.min(tax, 5_000_000);
  const profit = high - low - cappedTax;
  const roi = low > 0 ? (profit / low) * 100 : 0;
  return { profit, tax: cappedTax, roi };
}
export function getNaturePrice(latestPrices: Record<string, LatestPrice>): number {
  if (!latestPrices) return 0;
  return latestPrices[NATURE_RUNE_ID.toString()]?.low || 0;
}
export function calculateAlchProfit(highAlch: number, buyPrice: number, naturePrice: number) {
  if (!buyPrice || buyPrice <= 0) {
    return { profit: 0, roi: 0, natureCost: naturePrice };
  }
  const profit = highAlch - buyPrice - naturePrice;
  const roi = (buyPrice + naturePrice) > 0 ? (profit / (buyPrice + naturePrice)) * 100 : 0;
  return { profit, roi, natureCost: naturePrice };
}