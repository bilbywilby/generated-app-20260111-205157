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
import { cn, getItemIconUrl, isSinkItem, getSinkData } from '@/lib/utils';
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
    const dailyVolume = hourlyVol * 24;
    const maxDailyQty = Math.min(item.limit || Infinity, dailyVolume);
    const maxDailyProfit = stats.profit * maxDailyQty;
    return { ...stats, maxDailyProfit, maxDailyQty };
  }, [item, currentPrice, naturePrice, selectedId, latest1hPrices]);
  const copyId = () => {
    if (!selectedId) return;
    navigator.clipboard.writeText(selectedId.toString());
    setCopied(true);
    toast.success(`Copied Item ID: ${selectedId}`);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!item) return null;
  return (
    <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
      <SheetContent className="sm:max-w-xl bg-stone-950 border-stone-800 text-stone-200 overflow-y-auto scrollbar-thin">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl shadow-xl">
                <img src={getItemIconUrl(item.name)} alt={item.name} className="w-12 h-12 object-contain drop-shadow-lg" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold text-stone-100 flex items-center gap-2">
                  {item.name}
                </SheetTitle>
                <p className="text-sm text-stone-500 italic">"{item.examine}"</p>
                <div className="flex gap-2 mt-2">
                  {item.members && <Badge variant="secondary" className="bg-amber-900/20 text-amber-500 border-amber-900/30 text-[10px] uppercase font-black">Members</Badge>}
                  <Badge variant="outline" className="border-stone-800 text-stone-500 text-[10px] uppercase font-black">Limit: {item.limit?.toLocaleString() ?? '��'}</Badge>
                  <button onClick={copyId} className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-stone-800 bg-stone-900/50 hover:bg-stone-800 transition-colors group">
                    <Hash className="w-3 h-3 text-stone-600 group-hover:text-amber-500" />
                    <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-300">{item.id}</span>
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-stone-600 group-hover:text-stone-400" />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleWatchlist(item.id)}
              className={cn(
                "p-2.5 rounded-full border transition-all active:scale-90",
                isWatchlisted ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-stone-900 border-stone-800 text-stone-600 hover:text-stone-400"
              )}
            >
              <Star className={cn("w-5 h-5", isWatchlisted && "fill-current")} />
            </button>
          </div>
        </SheetHeader>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 bg-stone-900/50 border border-stone-800 rounded-lg shadow-sm">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Latest Buy (High)</p>
            <p className="text-xl font-mono font-bold text-emerald-500">{currentPrice?.high?.toLocaleString() ?? '---'} gp</p>
            <p className="text-[10px] text-stone-600 flex items-center gap-1 mt-1 font-mono uppercase">
              <Clock className="w-3 h-3" /> {currentPrice?.highTime ? format(currentPrice.highTime * 1000, 'HH:mm:ss') : '--:--:--'}
            </p>
          </div>
          <div className="p-4 bg-stone-900/50 border border-stone-800 rounded-lg shadow-sm">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Latest Sell (Low)</p>
            <p className="text-xl font-mono font-bold text-rose-500">{currentPrice?.low?.toLocaleString() ?? '---'} gp</p>
            <p className="text-[10px] text-stone-600 flex items-center gap-1 mt-1 font-mono uppercase">
              <Clock className="w-3 h-3" /> {currentPrice?.lowTime ? format(currentPrice.lowTime * 1000, 'HH:mm:ss') : '--:--:--'}
            </p>
          </div>
        </div>
        {margin && (
          <div className="mt-4 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Market Spread Logic
              </span>
              <span className="text-[10px] text-emerald-800 font-mono">2% GE TAX APPLIED</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-600 mb-1">Net Margin</p>
                <p className="font-mono font-bold text-emerald-400">{margin.profit.toLocaleString()} gp</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-600 mb-1">Tax Capped</p>
                <p className="font-mono font-bold text-stone-500">-{margin.tax.toLocaleString()} gp</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-600 mb-1">Return</p>
                <p className="font-mono font-bold text-emerald-400">{margin.roi.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}
        {isSink && (
          <div className="mt-4 p-5 bg-amber-500/5 border border-amber-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Market Stability: Item Sink Regulated</span>
            </div>
            <p className="text-[10px] text-stone-400 leading-relaxed">
              This item is part of the Jagex Item Sink mechanism. A portion of the 2% GE tax collected globally is used to purchase and permanently delete these items from the economy, maintaining high-value item scarcity.
            </p>
          </div>
        )}
        {alchAnalysis && (
          <div className="mt-4 p-5 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Wand2 className="w-12 h-12 text-amber-500" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> High Alchemy Floor
              </span>
              <span className="text-[10px] text-amber-800 font-mono">NATURE: ~{naturePrice} GP</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-stone-950/40 p-2 rounded border border-stone-800/50">
                <p className="text-[10px] uppercase font-bold text-stone-600 mb-1">Unit Profit</p>
                <p className={cn("font-mono font-bold text-sm", alchAnalysis.profit > 0 ? "text-amber-400" : "text-rose-500")}>
                  {alchAnalysis.profit.toLocaleString()}
                </p>
              </div>
              <div className="bg-stone-950/40 p-2 rounded border border-stone-800/50">
                <p className="text-[10px] uppercase font-bold text-stone-600 mb-1">Alch ROI</p>
                <p className={cn("font-mono font-bold text-sm", alchAnalysis.roi > 0 ? "text-amber-400" : "text-rose-500")}>
                  {alchAnalysis.roi.toFixed(1)}%
                </p>
              </div>
              <div className="bg-stone-950/40 p-2 rounded border border-stone-800/50">
                <p className="text-[10px] uppercase font-bold text-stone-600 mb-1">Daily Cap</p>
                <p className="font-mono font-bold text-sm text-stone-200">
                  {alchAnalysis.maxDailyProfit > 0 ? `${(alchAnalysis.maxDailyProfit/1000).toFixed(0)}k` : '0'} gp
                </p>
              </div>
            </div>
          </div>
        )}
        <Separator className="my-8 bg-stone-800/50" />
        <div className="space-y-4 pb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Pricing History</h3>
            <Tabs value={timeframe} onValueChange={(v: any) => setTimeframe(v)} className="w-auto">
              <TabsList className="bg-stone-900 border border-stone-800 h-8 p-1">
                <TabsTrigger value="5m" className="text-[10px] h-6 px-3 data-[state=active]:bg-stone-800 data-[state=active]:text-amber-500 uppercase font-black">5M</TabsTrigger>
                <TabsTrigger value="1h" className="text-[10px] h-6 px-3 data-[state=active]:bg-stone-800 data-[state=active]:text-amber-500 uppercase font-black">1H</TabsTrigger>
                <TabsTrigger value="6h" className="text-[10px] h-6 px-3 data-[state=active]:bg-stone-800 data-[state=active]:text-amber-500 uppercase font-black">6H</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="h-[280px] w-full bg-stone-900/30 rounded-xl p-4 border border-stone-800/50 shadow-inner">
            {isLoading ? (
              <div className="h-full w-full flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-stone-600 text-[10px] uppercase tracking-widest font-bold">Retrieving Timeseries...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} strokeOpacity={0.5} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis
                    domain={['auto', 'auto']}
                    orientation="right"
                    tick={{ fontSize: 9, fill: '#57534e', fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip
                    contentStyle={{ backgroundColor: '#0c0a09', border: '1px solid #292524', borderRadius: '8px', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                    itemStyle={{ color: '#f59e0b' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: any) => [`${value.toLocaleString()} gp`, 'PRICE']}
                  />
                  <Area type="monotone" dataKey="avgHighPrice" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}