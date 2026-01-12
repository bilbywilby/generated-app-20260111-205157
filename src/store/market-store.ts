import { create } from 'zustand';
import { ItemMapping, HourlyPriceData } from '@/lib/osrs-api';
interface MarketState {
  items: Record<number, ItemMapping>;
  itemIds: number[];
  isLoading: boolean;
  selectedItemId: number | null;
  latest1hPrices: Record<number, HourlyPriceData>;
  previous1hPrices: Record<number, HourlyPriceData>;
  setItems: (items: ItemMapping[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedItemId: (id: number | null) => void;
  setLatest1hPrices: (prices: Record<number, HourlyPriceData>) => void;
  setPrevious1hPrices: (prices: Record<number, HourlyPriceData>) => void;
}
export const useMarketStore = create<MarketState>((set) => ({
  items: {},
  itemIds: [],
  isLoading: true,
  selectedItemId: null,
  latest1hPrices: {},
  previous1hPrices: {},
  setItems: (itemsList) => {
    const itemMap = itemsList.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<number, ItemMapping>);
    set({ items: itemMap, itemIds: itemsList.map(i => i.id) });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
  setLatest1hPrices: (latest1hPrices) => set({ latest1hPrices }),
  setPrevious1hPrices: (previous1hPrices) => set({ previous1hPrices }),
}));