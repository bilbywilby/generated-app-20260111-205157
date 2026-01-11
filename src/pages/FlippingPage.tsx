import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPrices, calculateMargin } from '@/lib/osrs-api';
import { useMarketStore } from '@/store/market-store';
import { FlippingTable } from '@/components/market/FlippingTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, ShieldOff, Info } from 'lucide-react';
import { isSinkItem, isDumpItem } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
export function FlippingPage() {
  const itemIds = useMarketStore(s => s.itemIds);
  const items = useMarketStore(s => s.items);
  const filters = useMarketStore(s => s.flippingFilters);
  const setFilters = useMarketStore(s => s.setFlippingFilters);
  const latest1hPrices = useMarketStore(s => s.latest1hPrices);
  const previous1hPrices = useMarketStore(s => s.previous1hPrices);
  const { data: latestPrices } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: fetchLatestPrices,
    refetchInterval: 30000,
  });
  const filteredItems = React.useMemo(() => {
    if (!latestPrices) return [];
    return itemIds
      .map(id => {
        const p = latestPrices[id.toString()];
        const details = items[id];
        const hourly = latest1hPrices[id];
        const prevHourly = previous1hPrices[id];
        if (!p || !details || !hourly) return null;
        if (p.high === 0 || p.low === 0) return null;
        const margin = calculateMargin(p.high, p.low);
        const volume = (hourly.highPriceVolume + hourly.lowPriceVolume);
        const isDump = isDumpItem(hourly, prevHourly);
        if (filters.membersOnly && !details.members) return null;
        if (filters.hideSinkItems && isSinkItem(id)) return null;
        if (margin.profit < filters.minProfit) return null;
        if (margin.roi < filters.minROI) return null;
        if (volume < filters.minVolume) return null;
        return { id, margin, volume, isDump, ...p };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.margin.profit - a.margin.profit);
  }, [itemIds, items, latestPrices, latest1hPrices, previous1hPrices, filters]);
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-stone-900/50 p-6 rounded-xl border border-stone-800">
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl font-bold text-white tracking-tight uppercase">Tactical Flipping Engine</h1>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 text-[10px] text-stone-500 hover:text-stone-300 font-mono">
                    <Info className="w-3 h-3" /> VOLATILITY SCANNER ACTIVE
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-stone-900 border-stone-800 p-3 max-w-xs text-[11px] leading-relaxed">
                  <p className="font-bold text-amber-500 mb-1 uppercase">Dump Scanner Parameters:</p>
                  <ul className="list-disc list-inside space-y-1 text-stone-400">
                    <li>Volume: &gt;10,000 trades/hr</li>
                    <li>Price Velocity: &gt;10% drop vs 1h avg</li>
                    <li>Margin Sanity: &gt;1% ROI required</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-stone-500 uppercase">Min Profit (gp)</Label>
              <Input
                type="number"
                value={filters.minProfit}
                onChange={(e) => setFilters({ minProfit: Number(e.target.value) })}
                className="h-8 bg-stone-950 border-stone-800 text-xs font-mono focus-visible:ring-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-stone-500 uppercase">Min ROI (%)</Label>
              <Input
                type="number"
                value={filters.minROI}
                onChange={(e) => setFilters({ minROI: Number(e.target.value) })}
                className="h-8 bg-stone-950 border-stone-800 text-xs font-mono focus-visible:ring-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-stone-500 uppercase">Min Volume (1h)</Label>
              <Input
                type="number"
                value={filters.minVolume}
                onChange={(e) => setFilters({ minVolume: Number(e.target.value) })}
                className="h-8 bg-stone-950 border-stone-800 text-xs font-mono focus-visible:ring-amber-500/50"
              />
            </div>
            <div className="flex items-center gap-2 justify-end mt-4">
               <button
                 onClick={() => setFilters({ membersOnly: !filters.membersOnly })}
                 className={`h-8 px-4 rounded text-[10px] font-bold border transition-colors ${filters.membersOnly ? 'bg-amber-500 border-amber-600 text-black' : 'bg-stone-950 border-stone-800 text-stone-500'}`}
               >
                 {filters.membersOnly ? 'MEMBERS ONLY' : 'ALL ITEMS'}
               </button>
               <button
                 onClick={() => setFilters({ hideSinkItems: !filters.hideSinkItems })}
                 className={`h-8 px-4 rounded text-[10px] font-bold border transition-colors flex items-center gap-1.5 ${filters.hideSinkItems ? 'bg-amber-500 border-amber-600 text-black' : 'bg-stone-950 border-stone-800 text-stone-500'}`}
               >
                 {filters.hideSinkItems ? <ShieldOff className="w-3 h-3" /> : null}
                 {filters.hideSinkItems ? 'SINK HIDDEN' : 'SHOW SINKS'}
               </button>
            </div>
          </div>
        </div>
        <div className="text-right border-t md:border-t-0 md:border-l border-stone-800 pt-4 md:pt-0 md:pl-6">
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Opportunities Found</p>
          <p className="text-4xl font-mono font-bold text-amber-500">{filteredItems.length}</p>
        </div>
      </div>
      <div className="bg-stone-900/30 border border-stone-800 rounded-xl overflow-hidden">
        <FlippingTable data={filteredItems} />
      </div>
    </div>
  );
}