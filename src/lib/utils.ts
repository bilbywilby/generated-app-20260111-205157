import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatGP(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }
  return value.toString();
}
export function calculatePercentChange(current: number, previous: number): string {
  if (!previous || previous === 0) return "0.0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}
/**
 * Generates a standardized URL for OSRS item icons from the wiki.
 */
export function getItemIconUrl(name: string): string {
  if (!name) return '';
  const formattedName = name.replace(/ /g, '_');
  return `https://static.runescape.wiki/images/${formattedName}_detail.png`;
}