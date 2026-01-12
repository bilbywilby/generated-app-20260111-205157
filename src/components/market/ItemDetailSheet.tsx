import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMarketStore } from '@/store/market-store';
import { useQuery } from '@tanstack/react-query';
import { fetchTimeSeries, calculateMargin } from '@/lib/osrs-api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Star, Clock } from 'lucide-react';
import { cn, getItemIconUrl } from '@/lib/utils';
import { format } from 'date-fns';
export function ItemDetailSheet({ prices }: { prices: Record<string, any> }) {
  const selectedId = useMarketStore(s => s.selectedItemId);
  const setSelectedId = useMarketStore(s => s.setSelectedItemId);
  const items = useMarketStore(s => s.items);
  const watchlist = useMarketStore(s => s.watchlist);
  const toggleWatchlist = useMarketStore(s => s.toggleWatchlist);
  const [timeframe, setTimeframe] = useState<'5m' | '1h' | '6h'>('1h');
  const item = selectedId ? items[selectedId] : null;
  const currentPrice = selectedId ? prices[selectedId.toString()] : null;
  const isWatchlisted = selectedId ? watchlist.includes(selectedId) : false;
  const { data: history, isLoading } = useQuery({
    queryKey: ['timeseries', selectedId, timeframe],
    queryFn: () => selectedId ? fetchTimeSeries(selectedId, timeframe) : null,
    enabled: !!selectedId,
  });
  const margin = React.useMemo(() => {
    if (!currentPrice) return null;
    return calculateMargin(currentPrice.high, currentPrice.low);
  }, [currentPrice]);
  if (!item) return null;
  return (
    <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
      <SheetContent className="sm:max-w-xl bg-stone-950 border-stone-800 text-stone-200 overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl shadow-inner shadow-black/40">
                <img
                  src={getItemIconUrl(item.name)}
                  alt={item.name}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold text-stone-100">{item.name}</SheetTitle>
                <p className="text-sm text-stone-500 italic">"{item.examine}"</p>
                <div className="flex gap-2 mt-2">
                  {item.members && <Badge variant="secondary" className="bg-amber-900/30 text-amber-500 border-amber-900/50">Members</Badge>}
                  <Badge variant="outline" className="border-stone-800 text-stone-400">Limit: {item.limit?.toLocaleString() ?? 'Unknown'}</Badge>
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleWatchlist(item.id)}
              className={cn(
                "p-2 rounded-full border transition-all",
                isWatchlisted ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-stone-900 border-stone-800 text-stone-600 hover:text-stone-400"
              )}
            >
              <Star className={cn("w-5 h-5", isWatchlisted && "fill-current")} />
            </button>
          </div>
        </SheetHeader>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 bg-stone-900/50 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 mb-1">Latest Buy (High)</p>
            <p className="text-lg font-mono font-bold text-emerald-500">{currentPrice?.high?.toLocaleString() ?? '---'} gp</p>
            <p className="text-[10px] text-stone-600 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> {currentPrice?.highTime ? format(currentPrice.highTime * 1000, 'HH:mm:ss') : '--:--:--'}
            </p>
          </div>
          <div className="p-4 bg-stone-900/50 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 mb-1">Latest Sell (Low)</p>
            <p className="text-lg font-mono font-bold text-rose-500">{currentPrice?.low?.toLocaleString() ?? '---'} gp</p>
            <p className="text-[10px] text-stone-600 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> {currentPrice?.lowTime ? format(currentPrice.lowTime * 1000, 'HH:mm:ss') : '--:--:--'}
            </p>
          </div>
        </div>
        {margin && (
          <div className="mt-4 p-4 bg-amber-900/10 border border-amber-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-500 flex items-center gap-1">
                <Info className="w-4 h-4" /> Flipping Intelligence
              </span>
              <span className="text-xs text-amber-600">Incl. 1% GE Tax</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase text-stone-500">Net Profit</p>
                <p className="font-mono font-bold text-emerald-400">{margin.profit.toLocaleString()} gp</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-stone-500">Tax</p>
                <p className="font-mono font-bold text-stone-400">-{margin.tax.toLocaleString()} gp</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-stone-500">ROI</p>
                <p className="font-mono font-bold text-emerald-400">{margin.roi.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}
        <Separator className="my-8 bg-stone-800" />
        <div className="space-y-4">
          <div className="flex items-center justify-between h-8">
            <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">Price Analytics</h3>
            <Tabs value={timeframe} onValueChange={(v: any) => setTimeframe(v)} className="w-auto">
              <TabsList className="bg-stone-900 border border-stone-800 h-8 p-1">
                <TabsTrigger value="5m" className="text-[10px] h-6 px-2 data-[state=active]:bg-stone-800">5M</TabsTrigger>
                <TabsTrigger value="1h" className="text-[10px] h-6 px-2 data-[state=active]:bg-stone-800">1H</TabsTrigger>
                <TabsTrigger value="6h" className="text-[10px] h-6 px-2 data-[state=active]:bg-stone-800">6H</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="h-[250px] w-full bg-stone-900/30 rounded-lg p-2 border border-stone-800">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center text-stone-600 text-xs">Loading historical data...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    hide
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#57534e' }}
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #444', fontSize: '12px' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: any) => [`${value.toLocaleString()} gp`, 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgHighPrice"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}