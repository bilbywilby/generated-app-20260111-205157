import React, { useState, useMemo } from 'react';
import { useMarketStore } from '@/store/market-store';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPrices } from '@/lib/osrs-api';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, Search, Database } from 'lucide-react';
import { cn, getItemIconUrl, isSinkItem } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    return itemIds
      .map(id => items[id])
      .filter(item => item && item.name.toLowerCase().includes(search))
      .slice(0, 100);
  }, [itemIds, items, searchTerm]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Database className="w-6 h-6 text-amber-500" />
              Terminal Asset Database
            </h1>
            <p className="text-stone-500 text-xs font-mono uppercase tracking-widest">Real-time indexing: {itemIds.length.toLocaleString()} items</p>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
            <Input
              placeholder="Filter by name..."
              className="h-9 pl-9 bg-stone-900 border-stone-800 text-stone-200 text-xs font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-stone-900/30 border border-stone-800/60 rounded-xl overflow-hidden shadow-2xl">
          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800">
            <Table>
              <TableHeader className="bg-stone-950/80 sticky top-0 z-10">
                <TableRow className="border-stone-800 hover:bg-transparent">
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3">Asset</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-right">Limit</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-right">Market (High)</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-right text-amber-500/80">High Alch</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-center">Stability</TableHead>
                  <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-center">Tier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  if (!item) return null;
                  const isWatchlisted = watchlist.includes(item.id);
                  const isSink = isSinkItem(item.id);
                  const price = latestPrices?.[item.id.toString()];
                  return (
                    <TableRow
                      key={item.id}
                      className="border-stone-800/50 hover:bg-stone-900/40 cursor-pointer group transition-colors"
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      <TableCell className="p-1 px-3" onClick={(e) => { e.stopPropagation(); toggleWatchlist(item.id); }}>
                        <Star className={cn("w-3.5 h-3.5 transition-colors", isWatchlisted ? "fill-amber-500 text-amber-500" : "text-stone-700 hover:text-stone-500")} />
                      </TableCell>
                      <TableCell className="py-1.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 flex items-center justify-center bg-stone-950 border border-stone-800 rounded shrink-0">
                            <img src={getItemIconUrl(item.name, item.id)} alt="" className="w-4 h-4 object-contain" />
                          </div>
                          <span className="text-[11px] font-bold text-stone-200 truncate max-w-[180px]">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-1.5 px-3 font-mono text-[11px] text-stone-500">
                        {item.limit?.toLocaleString() ?? '∞'}
                      </TableCell>
                      <TableCell className="text-right py-1.5 px-3 font-mono text-[11px] text-emerald-400">
                        {price?.high && price.high > 0 ? price.high.toLocaleString() : '—'}
                      </TableCell>
                      <TableCell className="text-right py-1.5 px-3 font-mono text-[11px] text-amber-500/90 bg-amber-500/[0.02]">
                        {item.highalch ? item.highalch.toLocaleString() : '—'}
                      </TableCell>
                      <TableCell className="text-center py-1.5 px-3">
                        {isSink && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] h-4 px-1.5 font-mono cursor-help">SINK</Badge>
                              </TooltipTrigger>
                              <TooltipContent className="bg-stone-900 border-stone-800 text-[10px] p-2">Market Stability: GE Tax buyback regulated asset.</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-1.5 px-3">
                        {item.members && <Badge className="bg-stone-950 border-amber-900/40 text-amber-600 text-[9px] h-4 px-1 font-mono">MEMB</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}