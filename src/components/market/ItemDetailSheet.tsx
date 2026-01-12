import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMarketStore } from '@/store/market-store';
import { useQuery } from '@tanstack/react-query';
import { fetchTimeSeries, calculateMargin, calculateAlchProfit } from '@/lib/osrs-api';
import { AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Star, Clock, Wand2, Hash, Copy, Check, ShieldAlert } from 'lucide-react';
import { cn, getItemIconUrl, isSinkItem } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
export function ItemDetailSheet({ prices }: { prices: Record<string, any> }) {
  const selectedId = useMarketStore(s => s.selectedItemId);
  const setSelectedId = useMarketStore(s => s.setSelectedItemId);
  const items = useMarketStore(s => s.items);
  const watchlist = useMarketStore(s => s.watchlist);
  const toggleWatchlist = useMarketStore(s => s.toggleWatchlist);
  const naturePrice = useMarketStore(s => s.naturePrice);
  const latest1hPrices = useMarketStore(s => s.latest1hPrices);
  const [timeframe, setTimeframe] = useState<'5m' | '1h' | '6h'>('1h');
  const [copied, setCopied] = useState(false);
  const item = selectedId ? items[selectedId] : null;
  const currentPrice = selectedId ? prices[selectedId.toString()] : null;
  const isWatchlisted = selectedId ? watchlist.includes(selectedId) : false;
  const isSink = selectedId ? isSinkItem(selectedId) : false;
  const { data: history, isLoading } = useQuery({
    queryKey: ['timeseries', selectedId, timeframe],
    queryFn: () => selectedId ? fetchTimeSeries(selectedId, timeframe) : null,
    enabled: !!selectedId,
  });
  const margin = React.useMemo(() => {
    if (!currentPrice || currentPrice.high === 0 || currentPrice.low === 0) return null;
    return calculateMargin(currentPrice.high, currentPrice.low);
  }, [currentPrice]);
  const alchAnalysis = React.useMemo(() => {
    if (!item || !currentPrice || !item.highalch) return null;
    const stats = calculateAlchProfit(item.highalch, currentPrice.low, naturePrice);
    const hourlyVol = selectedId ? (latest1hPrices[selectedId]?.highPriceVolume || 0) + (latest1hPrices[selectedId]?.lowPriceVolume || 0) : 0;
    return { ...stats, dailyVol: hourlyVol * 24 };
  }, [item, currentPrice, naturePrice, selectedId, latest1hPrices]);
  const copyId = () => {
    if (!selectedId) return;
    navigator.clipboard.writeText(selectedId.toString());
    setCopied(true);
    toast.success(`Copied ID: ${selectedId}`);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!item) return null;
  return (
    <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
      <SheetContent className="sm:max-w-xl bg-stone-950 border-stone-800 text-stone-200 overflow-y-auto pt-10">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg shadow-xl shadow-black/40">
                <img src={getItemIconUrl(item.name)} alt={item.name} className="w-10 h-10 object-contain drop-shadow-md" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold text-stone-100">{item.name}</SheetTitle>
                <p className="text-[11px] text-stone-500 italic max-w-xs truncate">"{item.examine}"</p>
                <div className="flex gap-2 mt-2">
                  {item.members && <Badge className="bg-amber-900/10 text-amber-600 border-amber-900/20 text-[8px] h-4 font-mono">MEMB</Badge>}
                  <Badge className="bg-stone-900 border-stone-800 text-stone-500 text-[8px] h-4 font-mono">LIMIT: {item.limit?.toLocaleString() ?? '∞'}</Badge>
                  <button onClick={copyId} className="h-4 flex items-center gap-1.5 px-2 rounded bg-stone-900 border border-stone-800 hover:bg-stone-800 transition-transform active:scale-95 group">
                    <Hash className="w-2.5 h-2.5 text-stone-600 group-hover:text-amber-500" />
                    <span className="text-[9px] font-mono text-stone-500">{item.id}</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleWatchlist(item.id)}
              className={cn(
                "p-2 rounded-full border transition-all active:scale-90",
                isWatchlisted ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-stone-900 border-stone-800 text-stone-600 hover:text-stone-400"
              )}
            >
              <Star className={cn("w-4 h-4", isWatchlisted && "fill-current")} />
            </button>
          </div>
        </SheetHeader>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="p-3 bg-stone-900/40 border border-stone-800/60 rounded-lg">
            <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">Buy Price</p>
            <p className="text-lg font-mono font-bold text-emerald-500">{currentPrice?.high?.toLocaleString() ?? '---'}</p>
          </div>
          <div className="p-3 bg-stone-900/40 border border-stone-800/60 rounded-lg">
            <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">Sell Price</p>
            <p className="text-lg font-mono font-bold text-rose-500">{currentPrice?.low?.toLocaleString() ?? '---'}</p>
          </div>
        </div>
        {margin && (
          <div className="mt-4 p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><Info className="w-3 h-3" /> Net Spread (2% TAX)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[9px] text-stone-600 uppercase font-mono mb-0.5">Profit</p>
                <p className="font-mono font-bold text-[12px] text-emerald-400">{margin.profit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-stone-600 uppercase font-mono mb-0.5">ROI%</p>
                <p className="font-mono font-bold text-[12px] text-emerald-400">{margin.roi.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-[9px] text-stone-600 uppercase font-mono mb-0.5">Tax</p>
                <p className="font-mono font-bold text-[12px] text-stone-500">-{margin.tax.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
        {isSink && (
          <div className="mt-4 p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1.5"><ShieldAlert className="w-3 h-3 text-amber-500" /> <span className="text-[9px] font-bold text-amber-500 uppercase">Regulated Asset</span></div>
            <p className="text-[10px] text-stone-500 leading-tight">Jagex Item Sink active: Global GE tax buyback pool targets this item for deletion.</p>
          </div>
        )}
        {alchAnalysis && (
          <div className="mt-4 p-4 bg-stone-900/30 border border-stone-800/60 rounded-xl">
            <div className="flex items-center justify-between mb-3"><span className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1.5"><Wand2 className="w-3 h-3" /> Alch Floor</span> <span className="text-[9px] font-mono text-stone-600 uppercase">Nature: {naturePrice}gp</span></div>
            <div className="grid grid-cols-2 gap-2">
               <div className="text-center bg-stone-950 p-2 rounded border border-stone-800/50"><p className="text-[9px] text-stone-600 uppercase mb-0.5">Profit</p><p className={cn("font-mono font-bold text-[12px]", alchAnalysis.profit > 0 ? "text-amber-500" : "text-rose-500")}>{alchAnalysis.profit.toLocaleString()}</p></div>
               <div className="text-center bg-stone-950 p-2 rounded border border-stone-800/50"><p className="text-[9px] text-stone-600 uppercase mb-0.5">ROI</p><p className={cn("font-mono font-bold text-[12px]", alchAnalysis.roi > 0 ? "text-amber-500" : "text-rose-500")}>{alchAnalysis.roi.toFixed(1)}%</p></div>
            </div>
          </div>
        )}
        <Separator className="my-6 bg-stone-800/40" />
        <div className="space-y-4 pb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[9px] font-bold text-stone-600 uppercase tracking-widest">Time-Series Analytics</h3>
            <Tabs value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
              <TabsList className="bg-stone-900 border border-stone-800 h-7 p-1">
                <TabsTrigger value="5m" className="text-[9px] h-5 px-2 data-[state=active]:bg-stone-800 data-[state=active]:text-amber-500 uppercase font-mono">5M</TabsTrigger>
                <TabsTrigger value="1h" className="text-[9px] h-5 px-2 data-[state=active]:bg-stone-800 data-[state=active]:text-amber-500 uppercase font-mono">1H</TabsTrigger>
                <TabsTrigger value="6h" className="text-[9px] h-5 px-2 data-[state=active]:bg-stone-800 data-[state=active]:text-amber-500 uppercase font-mono">6H</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="h-[250px] sm:h-[350px] w-full bg-stone-900/20 rounded-xl p-2 border border-stone-800/40 shadow-inner">
            {isLoading ? (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-amber-500/50 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} strokeOpacity={0.3} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fontSize: 9, fill: '#57534e', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <ChartTooltip contentStyle={{ backgroundColor: '#0c0a09', border: '1px solid #292524', borderRadius: '4px', fontSize: '9px', fontFamily: 'JetBrains Mono' }} itemStyle={{ color: '#f59e0b' }} />
                  <Area type="monotone" dataKey="avgHighPrice" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}