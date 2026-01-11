import { create } from 'zustand';
import { ItemMapping } from '@/lib/osrs-api';
interface MarketState {
  items: Record<number, ItemMapping>;
  itemIds: number[];
  isLoading: boolean;
  selectedItemId: number | null;
  setItems: (items: ItemMapping[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedItemId: (id: number | null) => void;
}
export const useMarketStore = create<MarketState>((set) => ({
  items: {},
  itemIds: [],
  isLoading: true,
  selectedItemId: null,
  setItems: (itemsList) => {
    const itemMap = itemsList.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<number, ItemMapping>);
    set({ items: itemMap, itemIds: itemsList.map(i => i.id) });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
}));