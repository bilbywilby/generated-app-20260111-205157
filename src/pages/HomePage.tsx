import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchItemMapping, fetchLatestPrices, fetch1hPrices, HourlyPriceData } from '@/lib/osrs-api';
import { useMarketStore } from '@/store/market-store';
import { MarketTicker } from '@/components/market/MarketTicker';
import { TrendCard } from '@/components/market/TrendCard';
import { ItemSearch } from '@/components/market/ItemSearch';
import { ItemDetailSheet } from '@/components/market/ItemDetailSheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { formatGP, calculatePercentChange } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Terminal,
  Activity
} from 'lucide-react';
export function HomePage() {
  const setItems = useMarketStore(s => s.setItems);
  const setLoading = useMarketStore(s => s.setLoading);
  const setSelectedItemId = useMarketStore(s => s.setSelectedItemId);
  const latest1hPrices = useMarketStore(s => s.latest1hPrices);
  const previous1hPrices = useMarketStore(s => s.previous1hPrices);
  const setLatest1hPrices = useMarketStore(s => s.setLatest1hPrices);
  const setPrevious1hPrices = useMarketStore(s => s.setPrevious1hPrices);
  const itemIds = useMarketStore(s => s.itemIds);
  useQuery({
    queryKey: ['itemMapping'],
    queryFn: async () => {
      const data = await fetchItemMapping();
      setItems(data);
      setLoading(false);
      return data;
    },
    staleTime: Infinity,
  });
  const { data: latestPrices } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: fetchLatestPrices,
    refetchInterval: 30000,
  });
  const { data: hourlyData } = useQuery({
    queryKey: ['1hPrices'],
    queryFn: fetch1hPrices,
    refetchInterval: 300000,
  });
  useEffect(() => {
    if (hourlyData) {
      const parsed: Record<number, HourlyPriceData> = {};
      Object.entries(hourlyData).forEach(([id, data]) => {
        parsed[parseInt(id)] = data;
      });
      if (Object.keys(latest1hPrices).length > 0) {
        setPrevious1hPrices(latest1hPrices);
      }
      setLatest1hPrices(parsed);
    }
  }, [hourlyData]);
  const topGainers = React.useMemo(() => {
    return Object.entries(latest1hPrices)
      .filter(([id]) => previous1hPrices[parseInt(id)]?.avgHighPrice)
      .map(([id, curr]) => {
        const prev = previous1hPrices[parseInt(id)];
        const currPrice = curr.avgHighPrice || 0;
        const prevPrice = prev.avgHighPrice || 0;
        const change = prevPrice > 0 ? ((currPrice - prevPrice) / prevPrice) * 100 : 0;
        return { id: parseInt(id), change, price: currPrice };
      })
      .sort((a, b) => b.change - a.change)
      .slice(0, 4)
      .map(item => ({
        id: item.id,
        value: `${item.change >= 0 ? '+' : ''}${item.change.toFixed(1)}%`,
        subValue: `${formatGP(item.price)} gp`,
        isPositive: item.change >= 0
      }));
  }, [latest1hPrices, previous1hPrices]);
  const topLosers = React.useMemo(() => {
    return Object.entries(latest1hPrices)
      .filter(([id]) => previous1hPrices[parseInt(id)]?.avgHighPrice)
      .map(([id, curr]) => {
        const prev = previous1hPrices[parseInt(id)];
        const currPrice = curr.avgHighPrice || 0;
        const prevPrice = prev.avgHighPrice || 0;
        const change = prevPrice > 0 ? ((currPrice - prevPrice) / prevPrice) * 100 : 0;
        return { id: parseInt(id), change, price: currPrice };
      })
      .sort((a, b) => a.change - b.change)
      .slice(0, 4)
      .map(item => ({
        id: item.id,
        value: `${item.change.toFixed(1)}%`,
        subValue: `${formatGP(item.price)} gp`,
        isPositive: item.change >= 0
      }));
  }, [latest1hPrices, previous1hPrices]);
  const highVolume = React.useMemo(() => {
    return Object.entries(latest1hPrices)
      .map(([id, data]) => ({
        id: parseInt(id),
        totalVol: data.highPriceVolume + data.lowPriceVolume,
        avgPrice: data.avgHighPrice || 0
      }))
      .sort((a, b) => b.totalVol - a.totalVol)
      .slice(0, 4)
      .map(item => ({
        id: item.id,
        value: formatGP(item.totalVol),
        subValue: `${formatGP(item.avgPrice)} avg`,
        isPositive: undefined
      }));
  }, [latest1hPrices]);
  const marketStats = React.useMemo(() => {
    const totalVolume = Object.values(latest1hPrices).reduce((sum, d) => sum + (d.highPriceVolume + d.lowPriceVolume) * (d.avgHighPrice || 0), 0);
    const activeItems = Object.values(latest1hPrices).filter(d => (d.highPriceVolume + d.lowPriceVolume) > 0).length;
    return { totalVolume, activeItems };
  }, [latest1hPrices]);
  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-200 font-sans selection:bg-amber-500/30">
      <header className="sticky top-0 z-40 bg-[#0c0a09]/80 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <Terminal className="text-black w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              RUNE<span className="text-amber-500">TERMINAL</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <ItemSearch />
            <div className="h-4 w-px bg-stone-800" />
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-stone-400">WIKI API LIVE</span>
              </div>
              <Activity className="w-4 h-4 text-stone-500" />
            </div>
            <ThemeToggle className="static" />
          </div>
        </div>
      </header>
      <MarketTicker prices={latestPrices || {}} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Market Volume (1h)</p>
            <p className="text-xl font-mono font-bold text-white">{formatGP(marketStats.totalVolume)} gp</p>
          </div>
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Active Item Trades</p>
            <p className="text-xl font-mono font-bold text-white">{marketStats.activeItems.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Avg Index ROI</p>
            <p className="text-xl font-mono font-bold text-amber-500">1.42%</p>
          </div>
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Market Sentiment</p>
            <div className="flex items-center gap-2">
               <div className="h-2 flex-1 bg-stone-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: '60%' }} />
                  <div className="h-full bg-rose-500" style={{ width: '40%' }} />
               </div>
               <span className="text-xs font-mono text-emerald-500">STABLE</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TrendCard
            title="Top Gainers"
            icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
            items={topGainers}
            onSelect={setSelectedItemId}
          />
          <TrendCard
            title="Top Losers"
            icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
            items={topLosers}
            onSelect={setSelectedItemId}
          />
          <TrendCard
            title="High Volume"
            icon={<BarChart3 className="w-4 h-4 text-amber-500" />}
            items={highVolume}
            onSelect={setSelectedItemId}
          />
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4">
              <Zap className="w-12 h-12 text-amber-500 opacity-20" />
              <div>
                <h3 className="text-lg font-bold text-white">Opportunity Scanner</h3>
                <p className="text-stone-500 max-w-sm text-sm">Our algorithms are constantly scanning for tax-adjusted margins. Enable alerts to never miss a flip.</p>
              </div>
              <button className="px-6 py-2 bg-amber-500 text-black font-bold rounded-md hover:bg-amber-400 transition-colors">Coming Soon</button>
           </div>
           <div className="bg-stone-900 border border-stone-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Market News</h3>
                 <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-500">STABLE</span>
              </div>
              <div className="space-y-4">
                 <div className="border-l-2 border-amber-500 pl-4 py-1">
                    <p className="text-xs text-stone-500 mb-1">Live</p>
                    <p className="text-sm font-medium">Tracking {Object.keys(latest1hPrices).length} items across the Grand Exchange.</p>
                 </div>
                 <div className="border-l-2 border-stone-800 pl-4 py-1">
                    <p className="text-xs text-stone-500 mb-1">Update</p>
                    <p className="text-sm font-medium">Prices are polled from the OSRS Wiki API every 30 seconds.</p>
                 </div>
              </div>
           </div>
        </div>
      </main>
      <ItemDetailSheet prices={latestPrices || {}} />
      <footer className="py-12 border-t border-stone-900 text-center">
         <p className="text-xs text-stone-600">
           Data provided by OSRS Wiki Real-time Prices API. <br/>
           Old School RuneScape is a trademark of Jagex Ltd.
         </p>
      </footer>
    </div>
  );
}