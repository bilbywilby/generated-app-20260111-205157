import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchItemMapping, fetchLatestPrices } from '@/lib/osrs-api';
import { useMarketStore } from '@/store/market-store';
import { MarketTicker } from '@/components/market/MarketTicker';
import { TrendCard } from '@/components/market/TrendCard';
import { ItemSearch } from '@/components/market/ItemSearch';
import { ItemDetailSheet } from '@/components/market/ItemDetailSheet';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  // 1. Fetch Item Mapping on mount
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
  // 2. Poll Latest Prices
  const { data: latestPrices } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: fetchLatestPrices,
    refetchInterval: 30000,
  });
  // Derived data for widgets (Mocking sorting for demo phase)
  const topGainers = React.useMemo(() => {
    return [
      { id: 1038, value: "+12.4%", subValue: "185.2M", isPositive: true },
      { id: 12437, value: "+8.1%", subValue: "42.1M", isPositive: true },
      { id: 11802, value: "+5.2%", subValue: "281.5M", isPositive: true },
      { id: 21003, value: "+4.9%", subValue: "1.2B", isPositive: true },
    ];
  }, []);
  const topLosers = React.useMemo(() => {
    return [
      { id: 20997, value: "-14.2%", subValue: "850.1M", isPositive: false },
      { id: 13576, value: "-9.5%", subValue: "14.2M", isPositive: false },
      { id: 11832, value: "-4.1%", subValue: "45.2M", isPositive: false },
      { id: 6585, value: "-3.2%", subValue: "9.1M", isPositive: false },
    ];
  }, []);
  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-200 font-sans selection:bg-amber-500/30">
      {/* Header */}
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
      {/* Scrolling Ticker */}
      <MarketTicker prices={latestPrices || {}} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Market Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Index Volume</p>
            <p className="text-xl font-mono font-bold text-white">2,142.5B <span className="text-xs text-emerald-500">+1.2%</span></p>
          </div>
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Total Trades</p>
            <p className="text-xl font-mono font-bold text-white">428,102</p>
          </div>
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Top Sector</p>
            <p className="text-xl font-mono font-bold text-amber-500">PVM Gear</p>
          </div>
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Market Sentiment</p>
            <div className="flex items-center gap-2">
               <div className="h-2 flex-1 bg-stone-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: '65%' }} />
                  <div className="h-full bg-rose-500" style={{ width: '35%' }} />
               </div>
               <span className="text-xs font-mono text-emerald-500">BULLISH</span>
            </div>
          </div>
        </div>
        {/* Dashboard Grid */}
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
            items={[
              { id: 2, value: "1.2B", subValue: "Cannonball" },
              { id: 561, value: "850M", subValue: "Nature Rune" },
              { id: 5314, value: "420M", subValue: "Willow Seed" },
              { id: 314, value: "310M", subValue: "Feather" },
            ]}
            onSelect={setSelectedItemId}
          />
        </div>
        {/* Large Widget Area */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4">
              <Zap className="w-12 h-12 text-amber-500 opacity-20" />
              <div>
                <h3 className="text-lg font-bold text-white">Live Opportunity Scanner</h3>
                <p className="text-stone-500 max-w-sm text-sm">Our algorithms are constantly scanning for tax-adjusted margins. Enable alerts to never miss a flip.</p>
              </div>
              <button className="px-6 py-2 bg-amber-500 text-black font-bold rounded-md hover:bg-amber-400 transition-colors">Start Scanning</button>
           </div>
           <div className="bg-stone-900 border border-stone-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Market News</h3>
                 <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-500">STABLE</span>
              </div>
              <div className="space-y-4">
                 <div className="border-l-2 border-amber-500 pl-4 py-1">
                    <p className="text-xs text-stone-500 mb-1">14:02 UTC</p>
                    <p className="text-sm font-medium">Twisted Bow price stabilizes after weekly volatility spike.</p>
                 </div>
                 <div className="border-l-2 border-stone-800 pl-4 py-1">
                    <p className="text-xs text-stone-500 mb-1">12:15 UTC</p>
                    <p className="text-sm font-medium">Consumables volume up 15% following latest game update news.</p>
                 </div>
                 <div className="border-l-2 border-stone-800 pl-4 py-1">
                    <p className="text-xs text-stone-500 mb-1">09:30 UTC</p>
                    <p className="text-sm font-medium">Unexpected dip in Runite Ore prices as supply increases.</p>
                 </div>
              </div>
           </div>
        </div>
      </main>
      {/* Global Modals */}
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