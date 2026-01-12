import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPrices } from '@/lib/osrs-api';
import { useMarketStore } from '@/store/market-store';
import { MarketTicker } from '@/components/market/MarketTicker';
import { TrendCard } from '@/components/market/TrendCard';
import { formatGP, calculateIndexPerformance, cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Star,
  ShieldCheck,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { MARKET_BASKETS, BasketCategory } from '@/lib/indices';
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
        value: `${formatGP(currPrice)}`,
        subValue: change !== 0 ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : '0.0%',
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
        subValue: `${formatGP(item.price)}`,
        isPositive: true
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
        subValue: `${formatGP(item.price)}`,
        isPositive: false
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
        subValue: `${formatGP(item.avgPrice)}`,
        isPositive: undefined
      }));
  }, [latest1hPrices]);
  return (
    <div className="flex flex-col min-h-full">
      <MarketTicker prices={latestPrices || {}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Market Vol (1h)', value: '840.2M', color: 'text-stone-100' },
            { label: 'Trade Pairs', value: '3,124', color: 'text-stone-100' },
            { label: 'Watchlist Size', value: watchlist.length, color: 'text-amber-500' },
            { label: 'Latency (Wiki)', value: '45ms', color: 'text-emerald-500' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 bg-stone-900/40 border border-stone-800/60 rounded-lg shadow-inner"
            >
              <p className="text-[9px] text-stone-500 uppercase font-black tracking-widest mb-1">{stat.label}</p>
              <p className={`text-lg font-mono font-black ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3 h-3 text-stone-500" />
            <h2 className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">Asset Sectoral Indices</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {(Object.keys(MARKET_BASKETS) as BasketCategory[]).map((cat, i) => {
              const perf = calculateIndexPerformance(MARKET_BASKETS[cat], latest1hPrices, previous1hPrices);
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="bg-stone-900/20 border-stone-800/60 hover:bg-stone-800/30 transition-colors">
                    <CardContent className="p-2 text-center">
                      <p className="text-[8px] font-black text-stone-600 uppercase mb-0.5">{cat}</p>
                      <p className={cn("text-[10px] font-mono font-black", perf > 0 ? "text-emerald-500" : perf < 0 ? "text-rose-500" : "text-stone-500")}>
                        {perf > 0 ? '+' : ''}{perf.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        >
          <TrendCard title="My Watchlist" icon={<Star className="w-3 h-3 text-amber-500" />} items={watchlistItems} onSelect={setSelectedItemId} />
          <TrendCard title="Market Gainers" icon={<TrendingUp className="w-3 h-3 text-emerald-500" />} items={topGainers} onSelect={setSelectedItemId} />
          <TrendCard title="Market Losers" icon={<TrendingDown className="w-3 h-3 text-rose-500" />} items={topLosers} onSelect={setSelectedItemId} />
          <TrendCard title="Trade Volume" icon={<BarChart3 className="w-3 h-3 text-amber-500" />} items={highVolume} onSelect={setSelectedItemId} />
        </motion.div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-stone-900/20 border border-stone-800/60 rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4">
            <Zap className="w-12 h-12 text-amber-500/10 absolute top-4 left-4" />
            <div className="max-w-md">
              <h3 className="text-xl font-bold text-white tracking-tight">Tactical Flipping Engine</h3>
              <p className="text-stone-500 text-[11px] leading-relaxed mt-1 uppercase tracking-wider font-mono">Real-time Margin Analysis with 2% Net Adjusted Profit Calculation</p>
            </div>
            <button
              onClick={() => navigate('/flipping')}
              className="px-6 py-2 bg-amber-500 text-black text-[10px] font-black rounded border border-amber-600 hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/10 uppercase tracking-[0.2em]"
            >
              Initialize Engine
            </button>
          </div>
          <div className="bg-stone-900/40 border border-stone-800/60 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-stone-800/60 bg-stone-950/60 flex items-center justify-between">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Terminal Console</h3>
              <RefreshCw className={`w-2.5 h-2.5 text-stone-700 ${pricesLoading ? 'animate-spin' : ''}`} />
            </div>
            <div className="p-4 space-y-3 font-mono text-[10px]">
              <div className="flex gap-2"><span className="text-emerald-500 font-bold">[SYS]</span><span className="text-stone-300">Auth linking established (OK)</span></div>
              <div className="flex gap-2"><span className="text-amber-500 font-bold">[MKT]</span><span className="text-stone-300">Poll 3,000+ tradable pairs (OK)</span></div>
              <div className="flex gap-2"><span className="text-stone-600 font-bold">[IDX]</span><span className="text-stone-300">Sectoral basket sync: 1h window</span></div>
              <div className="pt-2 border-t border-stone-800/40 flex flex-col items-center gap-1 opacity-40"><Cpu className="w-4 h-4" /><span className="text-[8px] tracking-[0.3em]">X-CORE_v1.0.9</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}