import React, { useState, useMemo } from 'react';
import { useMarketStore } from '@/store/market-store';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPrices } from '@/lib/osrs-api';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, Search, Database } from 'lucide-react';
import { cn, getItemIconUrl } from '@/lib/utils';
export function PriceDatabasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const itemIds = useMarketStore(s => s.itemIds);
  const items = useMarketStore(s => s.items);
  const watchlist = useMarketStore(s => s.watchlist);
  const toggleWatchlist = useMarketStore(s => s.toggleWatchlist);
  const setSelectedItemId = useMarketStore(s => s.setSelectedItemId);
  const { data: latestPrices } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: fetchLatestPrices,
    refetchInterval: 30000,
  });
  const filteredItems = useMemo(() => {
    const search = searchTerm.toLowerCase();
    const results = itemIds
      .map(id => items[id])
      .filter(item => item && item.name.toLowerCase().includes(search))
      .slice(0, 100);
    return results;
  }, [itemIds, items, searchTerm]);
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-amber-500" />
            Price Database
          </h1>
          <p className="text-stone-500 text-sm">Explore the entire Grand Exchange catalog with real-time data.</p>
        </div>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <Input
            placeholder="Filter by item name..."
            className="pl-10 bg-stone-900 border-stone-800 text-stone-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-stone-900/40 border border-stone-800 rounded-xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-stone-950/50">
            <TableRow className="border-stone-800 hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-stone-500">Item</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-stone-500 text-right">Buy Limit</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-stone-500 text-right">High Price</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-stone-500 text-right">Low Price</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-stone-500 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              if (!item) return null;
              const isWatchlisted = watchlist.includes(item.id);
              const price = latestPrices?.[item.id.toString()];
              return (
                <TableRow
                  key={item.id}
                  className="border-stone-800 hover:bg-stone-800/30 cursor-pointer group"
                  onClick={() => setSelectedItemId(item.id)}
                >
                  <TableCell onClick={(e) => { e.stopPropagation(); toggleWatchlist(item.id); }}>
                    <Star className={cn("w-4 h-4 transition-colors", isWatchlisted ? "fill-amber-500 text-amber-500" : "text-stone-700 hover:text-stone-500")} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-stone-950 border border-stone-800 rounded">
                        <img
                          src={getItemIconUrl(item.name)}
                          alt=""
                          className="w-6 h-6 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs font-bold text-stone-200">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-stone-400">
                    {item.limit?.toLocaleString() ?? '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-400">
                    {price?.high && price.high > 0 ? price.high.toLocaleString() : '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-rose-400">
                    {price?.low && price.low > 0 ? price.low.toLocaleString() : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.members && <Badge variant="outline" className="text-[9px] border-amber-900/50 text-amber-600 px-1 py-0 h-4 uppercase">M</Badge>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredItems.length === 0 && (
          <div className="py-20 text-center text-stone-600 text-sm">
            No items found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}