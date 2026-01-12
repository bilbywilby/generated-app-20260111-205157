import { create } from 'zustand';
import { ItemMapping, HourlyPriceData } from '@/lib/osrs-api';
import { ApiResponse } from '@shared/types';
interface FlippingFilters {
  minProfit: number;
  minROI: number;
  minVolume: number;
  membersOnly: boolean;
}
interface MarketState {
  items: Record<number, ItemMapping>;
  itemIds: number[];
  isLoading: boolean;
  selectedItemId: number | null;
  latest1hPrices: Record<number, HourlyPriceData>;
  previous1hPrices: Record<number, HourlyPriceData>;
  flippingFilters: FlippingFilters;
  watchlist: number[];
  naturePrice: number;
  setItems: (items: ItemMapping[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedItemId: (id: number | null) => void;
  updateHourlyPrices: (prices: Record<number, HourlyPriceData>) => void;
  setFlippingFilters: (filters: Partial<FlippingFilters>) => void;
  fetchWatchlist: () => Promise<void>;
  toggleWatchlist: (itemId: number) => Promise<void>;
  setNaturePrice: (price: number) => void;
}
export const useMarketStore = create<MarketState>((set, get) => ({
  items: {},
  itemIds: [],
  isLoading: true,
  selectedItemId: null,
  latest1hPrices: {},
  previous1hPrices: {},
  flippingFilters: {
    minProfit: 100,
    minROI: 1,
    minVolume: 10,
    membersOnly: false,
  },
  watchlist: [],
  naturePrice: 0,
  setItems: (itemsList) => {
    const itemMap = itemsList.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<number, ItemMapping>);
    set({ items: itemMap, itemIds: itemsList.map((i) => i.id) });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
  updateHourlyPrices: (newPrices) =>
    set((state) => ({
      previous1hPrices: state.latest1hPrices,
      latest1hPrices: newPrices,
    })),
  setFlippingFilters: (filters) =>
    set((state) => ({
      flippingFilters: { ...state.flippingFilters, ...filters },
    })),
  fetchWatchlist: async () => {
    try {
      const response = await fetch('/api/watchlist');
      const result = await response.json() as ApiResponse<number[]>;
      if (result.success && result.data) {
        set({ watchlist: result.data });
      }
    } catch (error) {
      console.error('Failed to fetch watchlist', error);
    }
  },
  toggleWatchlist: async (itemId) => {
    const current = get().watchlist;
    const exists = current.includes(itemId);
    const next = exists ? current.filter(id => id !== itemId) : [...current, itemId];
    set({ watchlist: next });
    try {
      const response = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const result = await response.json() as ApiResponse<number[]>;
      if (result.success && result.data) {
        set({ watchlist: result.data });
      }
    } catch (error) {
      console.error('Failed to toggle watchlist item', error);
      set({ watchlist: current });
    }
  },
  setNaturePrice: (naturePrice) => set({ naturePrice }),
}));