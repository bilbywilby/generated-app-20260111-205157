import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ITEM_SINK_MAPPING, SinkMetadata } from "./sink-list"
import { HourlyPriceData } from "./osrs-api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatGP(value: number): string {
  if (value === 0) return "0";
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(2)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(0)}k`;
  }
  return `${sign}${absValue.toLocaleString()}`;
}
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}
export function calculatePercentChange(current: number, previous: number): string {
  if (!previous || previous === 0) return "0.0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}
/**
 * Generates a standardized URL for OSRS item icons from the wiki.
 * Handles spaces, special characters, and formatting.
 */
export function getItemIconUrl(name: string): string {
  if (!name) return '';
  // The wiki typically expects spaces replaced with underscores and special characters escaped or handled.
  // Apostrophes are usually kept as is or encoded in the URL.
  const formattedName = name.replace(/ /g, '_');
  return `https://static.runescape.wiki/images/${formattedName}_detail.png`;
}

export function isSinkItem(id: number): boolean {
  return !!ITEM_SINK_MAPPING[id];
}

export function getSinkData(id: number): SinkMetadata | undefined {
  return ITEM_SINK_MAPPING[id];
}

export function calculateIndexPerformance(
  ids: number[], 
  latestPrices: Record<number, HourlyPriceData>, 
  previousPrices: Record<number, HourlyPriceData>
): number {
  if (!ids.length) return 0;
  let totalChange = 0;
  let validItems = 0;
  ids.forEach(id => {
    const curr = latestPrices[id]?.avgHighPrice;
    const prev = previousPrices[id]?.avgHighPrice;
    if (curr && prev && prev > 0) {
      totalChange += ((curr - prev) / prev) * 100;
      validItems++;
    }
  });
  return validItems > 0 ? totalChange / validItems : 0;
}