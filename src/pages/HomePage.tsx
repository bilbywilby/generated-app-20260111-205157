import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPrices } from '@/lib/osrs-api';
import { useMarketStore } from '@/store/market-store';
import { MarketTicker } from '@/components/market/MarketTicker';
import { TrendCard } from '@/components/market/TrendCard';
import { formatGP } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Star,
  Plus,
  ShieldCheck,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { MARKET_BASKETS, BasketCategory } from '@/lib/indices';
import { calculateIndexPerformance, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
  const { data: latestPrices, isLoading: pricesLoading } = useQuery({
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
          {[
            { label: 'Market Volume (1h)', value: formatGP(marketStats.totalVolume), color: 'text-white' },
            { label: 'Active Trade Pairs', value: marketStats.activeItems.toLocaleString(), color: 'text-white' },
            { label: 'Watchlist Items', value: watchlist.length, color: 'text-amber-500' },
            { label: 'System Uptime', value: '99.99%', color: 'text-emerald-500', isStatus: true }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-stone-900 border border-stone-800 rounded-lg shadow-inner shadow-black/20"
            >
              <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">{stat.label}</p>
              {stat.isStatus ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xl font-mono font-bold text-emerald-500">STABLE</p>
                </div>
              ) : (
                <p className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-stone-500" />
            <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Macro Market Indices</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {(Object.keys(MARKET_BASKETS) as BasketCategory[]).map((cat, i) => {
              const perf = calculateIndexPerformance(MARKET_BASKETS[cat], latest1hPrices, previous1hPrices);
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-stone-900/40 border-stone-800 hover:bg-stone-800/40 transition-colors">
                    <CardContent className="p-3">
                      <p className="text-[9px] font-bold text-stone-500 uppercase mb-1">{cat}</p>
                      <p className={cn(
                        "text-xs font-mono font-bold",
                        perf > 0 ? "text-emerald-500" : perf < 0 ? "text-rose-500" : "text-stone-400"
                      )}>
                        {perf > 0 ? '+' : ''}{perf.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TrendCard title="My Watchlist" icon={<Star className="w-4 h-4 text-amber-500" />} items={watchlistItems} onSelect={setSelectedItemId} />
          <TrendCard title="Top Gainers" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} items={topGainers} onSelect={setSelectedItemId} />
          <TrendCard title="Top Losers" icon={<TrendingDown className="w-4 h-4 text-rose-500" />} items={topLosers} onSelect={setSelectedItemId} />
          <TrendCard title="High Volume" icon={<BarChart3 className="w-4 h-4 text-amber-500" />} items={highVolume} onSelect={setSelectedItemId} />
        </div>
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-8 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <Zap className="w-16 h-16 text-amber-500 opacity-20 floating" />
            <div className="max-w-md space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Tactical Flipping Engine</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Aggregating real-time pricing data to identify high-ROI trade opportunities. 
                Factoring in the 1% Grand Exchange tax automatically for true net profit analysis.
              </p>
            </div>
            <button
              onClick={() => navigate('/flipping')}
              className="px-8 py-3 bg-amber-500 text-black text-sm font-black rounded-lg hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20 uppercase tracking-widest"
            >
              LAUNCH ENGINE
            </button>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-stone-800 bg-stone-950/50 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Terminal Logs
              </h3>
              <RefreshCw className={`w-3 h-3 text-stone-600 ${pricesLoading ? 'animate-spin' : ''}`} />
            </div>
            <div className="p-6 space-y-5 font-mono">
              <div className="space-y-1">
                <p className="text-[10px] text-emerald-500">[SYSTEM] SESSION_INIT_OK</p>
                <p className="text-xs text-stone-300">Terminal linked to OSRS Real-time API.</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-amber-500">[MARKET] DATA_SYNC_COMPLETE</p>
                <p className="text-xs text-stone-300">Tracking {marketStats.activeItems} active item pairs.</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-stone-500">[CLIENT] WATCHLIST_LOADED</p>
                <p className="text-xs text-stone-300">{watchlist.length} items synced from persistent store.</p>
              </div>
              <div className="pt-4 border-t border-stone-800/50 flex flex-col items-center gap-2">
                 <Cpu className="w-6 h-6 text-stone-800" />
                 <span className="text-[9px] text-stone-600 uppercase tracking-widest">RUNE-X-CORE v1.0.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}