import React, { useState, useMemo } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useMarketStore } from '@/store/market-store';
import { useHotkeys } from 'react-hotkeys-hook';
import { Search } from 'lucide-react';
import { getItemIconUrl } from '@/lib/utils';
export function ItemSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const items = useMarketStore(s => s.items);
  const itemIds = useMarketStore(s => s.itemIds);
  const setSelectedItemId = useMarketStore(s => s.setSelectedItemId);
  const isLoading = useMarketStore(s => s.isLoading);
  useHotkeys('meta+k, ctrl+k', (e) => {
    e.preventDefault();
    setOpen((o) => !o);
  });
  const filteredResults = useMemo(() => {
    if (!search.trim()) return itemIds.slice(0, 100);
    const query = search.toLowerCase();
    return itemIds
      .filter(id => items[id]?.name.toLowerCase().includes(query))
      .slice(0, 100);
  }, [search, itemIds, items]);
  const handleSelect = (id: number) => {
    setSelectedItemId(id);
    setOpen(false);
    setSearch("");
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-stone-900 border border-stone-800 rounded-md hover:border-stone-700 transition-all w-full max-w-[200px] group"
      >
        <Search className="w-3.5 h-3.5 group-hover:text-amber-500 transition-colors" />
        <span className="truncate">{isLoading ? "Indexing Assets..." : "Search Market..."}</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-stone-800 bg-stone-950 px-1.5 font-mono text-[10px] font-medium opacity-100 shrink-0">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type an item name..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="max-h-[400px] scrollbar-thin scrollbar-thumb-stone-800">
          <CommandEmpty>{isLoading ? "Indexing catalog, please wait..." : "No items found."}</CommandEmpty>
          <CommandGroup heading="Tradable Assets">
            {filteredResults.map((id) => (
              <CommandItem
                key={id}
                onSelect={() => handleSelect(id)}
                className="flex items-center gap-3 cursor-pointer p-2 aria-selected:bg-stone-800"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-stone-950 border border-stone-800 rounded shrink-0">
                  <img
                    src={getItemIconUrl(items[id]?.name || '', id)}
                    alt=""
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-stone-200 truncate">{items[id]?.name}</span>
                  <span className="text-[10px] text-stone-500 font-mono">ID: {id}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}