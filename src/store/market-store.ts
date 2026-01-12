import { create } from 'zustand';
import { ItemMapping, HourlyPriceData } from '@/lib/osrs-api';
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
  setItems: (items: ItemMapping[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedItemId: (id: number | null) => void;
  updateHourlyPrices: (prices: Record<number, HourlyPriceData>) => void;
  setFlippingFilters: (filters: Partial<FlippingFilters>) => void;
}
export const useMarketStore = create<MarketState>((set) => ({
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
}));