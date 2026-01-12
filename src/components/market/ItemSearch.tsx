import React from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useMarketStore } from '@/store/market-store';
import { useHotkeys } from 'react-hotkeys-hook';
import { Search } from 'lucide-react';
import { getItemIconUrl } from '@/lib/utils';
export function ItemSearch() {
  const [open, setOpen] = React.useState(false);
  const items = useMarketStore(s => s.items);
  const itemIds = useMarketStore(s => s.itemIds);
  const setSelectedItemId = useMarketStore(s => s.setSelectedItemId);
  useHotkeys('meta+k, ctrl+k', (e) => {
    e.preventDefault();
    setOpen((o) => !o);
  });
  const handleSelect = (id: number) => {
    setSelectedItemId(id);
    setOpen(false);
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-stone-900 border border-stone-800 rounded-md hover:border-stone-700 transition-all w-full max-w-[200px]"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search Market...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type an item name..." />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No items found.</CommandEmpty>
          <CommandGroup heading="Tradable Items">
            {itemIds.slice(0, 1000).map((id) => (
              <CommandItem
                key={id}
                onSelect={() => handleSelect(id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={getItemIconUrl(items[id]?.name || '')}
                  alt=""
                  className="w-6 h-6 object-contain opacity-70"
                  loading="lazy"
                />
                <span>{items[id]?.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}