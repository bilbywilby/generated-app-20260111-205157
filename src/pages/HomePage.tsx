import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPrices } from '@/lib/osrs-api';
import { useMarketStore } from '@/store/market-store';
import { MarketTicker } from '@/components/market/MarketTicker';
import { TrendCard } from '@/components/market/TrendCard';
import { formatGP } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Star,
  Plus
} from 'lucide-react';
export function HomePage() {
  const navigate = useNavigate();
  const latest1hPrices = useMarketStore(s => s.latest1hPrices);
  const previous1hPrices = useMarketStore(s => s.previous1hPrices);
  const setSelectedItemId = useMarketStore(s => s.setSelectedItemId);
  const watchlist = useMarketStore(s => s.watchlist);
  const fetchWatchlist = useMarketStore(s => s.fetchWatchlist);
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);
  const { data: latestPrices } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: fetchLatestPrices,
    refetchInterval: 30000,
  });
  const watchlistItems = React.useMemo(() => {
    return watchlist.map(id => {
      const data = latest1hPrices[id];
      const prev = previous1hPrices[id];
      const currPrice = data?.avgHighPrice || latestPrices?.[id.toString()]?.high || 0;
      const prevPrice = prev?.avgHighPrice || 0;
      const change = prevPrice > 0 ? ((currPrice - prevPrice) / prevPrice) * 100 : 0;
      return {
        id,
        value: `${formatGP(currPrice)} gp`,
        subValue: change !== 0 ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : undefined,
        isPositive: change > 0 ? true : change < 0 ? false : undefined
      };
    }).slice(0, 4);
  }, [watchlist, latest1hPrices, previous1hPrices, latestPrices]);
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
    <div className="flex flex-col min-h-full">
      <MarketTicker prices={latestPrices || {}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-1">Market Volume (1h)</p>
            <p className="text-xl font-mono font-bold text-white">{formatGP(marketStats.totalVolume)} gp</p>
          </div>
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-1">Active Item Trades</p>
            <p className="text-xl font-mono font-bold text-white">{marketStats.activeItems.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-1">Watchlist Items</p>
            <p className="text-xl font-mono font-bold text-amber-500">{watchlist.length}</p>
          </div>
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-lg">
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-1">Terminal Status</p>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-mono text-emerald-500">NOMINAL</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TrendCard
            title="My Watchlist"
            icon={<Star className="w-4 h-4 text-amber-500" />}
            items={watchlistItems}
            onSelect={setSelectedItemId}
          />
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
        {watchlist.length === 0 && (
          <div className="mt-6 p-6 border border-dashed border-stone-800 rounded-xl bg-stone-900/10 flex flex-col items-center justify-center text-center space-y-3">
             <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center border border-stone-800">
               <Plus className="w-5 h-5 text-stone-500" />
             </div>
             <div>
               <p className="text-sm font-bold text-stone-300">Your Watchlist is Empty</p>
               <p className="text-xs text-stone-500">Track specific items to see them in your terminal dashboard.</p>
             </div>
             <button 
               onClick={() => navigate('/items')}
               className="text-[10px] font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400"
             >
               Go to Database
             </button>
          </div>
        )}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 min-h-[250px] flex flex-col justify-center items-center text-center space-y-4">
              <Zap className="w-12 h-12 text-amber-500 opacity-20" />
              <div>
                <h3 className="text-lg font-bold text-white">Tactical Flipping Tool</h3>
                <p className="text-stone-500 max-w-sm text-sm">Real-time margin analysis factoring in the 1% GE tax. Find the most profitable trades instantly.</p>
              </div>
              <button
                onClick={() => navigate('/flipping')}
                className="px-6 py-2 bg-amber-500 text-black text-sm font-bold rounded-md hover:bg-amber-400 transition-colors"
              >
                OPEN FLIPPING ENGINE
              </button>
           </div>
           <div className="bg-stone-900 border border-stone-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Terminal Notifications</h3>
              </div>
              <div className="space-y-4">
                 <div className="border-l border-amber-500 pl-4 py-1">
                    <p className="text-xs text-stone-500 mb-0.5">Watchlist Synced</p>
                    <p className="text-sm font-medium">Terminal state persists across sessions using Cloudflare DO.</p>
                 </div>
                 <div className="border-l border-stone-800 pl-4 py-1">
                    <p className="text-xs text-stone-500 mb-0.5">Market Index</p>
                    <p className="text-sm font-medium">Tracking {Object.keys(latest1hPrices).length} active market pairs.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}