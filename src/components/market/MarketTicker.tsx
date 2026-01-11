import React from 'react';
import { motion } from 'framer-motion';
import { useMarketStore } from '@/store/market-store';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
interface TickerProps {
  prices: Record<string, { high: number; low: number }>;
}
export function MarketTicker({ prices }: TickerProps) {
  const items = useMarketStore(s => s.items);
  const latest1hPrices = useMarketStore(s => s.latest1hPrices);
  const previous1hPrices = useMarketStore(s => s.previous1hPrices);
  const tickerItems = React.useMemo(() => {
    return Object.entries(latest1hPrices)
      .map(([id, data]) => ({
        id: parseInt(id),
        name: items[parseInt(id)]?.name || 'Unknown',
        price: prices[id]?.high || data.avgHighPrice || 0,
        volume: data.highPriceVolume + data.lowPriceVolume,
        change: (data.avgHighPrice && previous1hPrices[parseInt(id)]?.avgHighPrice)
          ? ((data.avgHighPrice - previous1hPrices[parseInt(id)].avgHighPrice!) / previous1hPrices[parseInt(id)].avgHighPrice!) * 100
          : 0
      }))
      .filter(i => i.price > 0 && i.name !== 'Unknown')
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 20);
  }, [items, latest1hPrices, previous1hPrices, prices]);
  if (tickerItems.length === 0) return null;
  return (
    <div className="w-full overflow-hidden bg-stone-950 border-y border-stone-800/40 py-1.5 select-none shadow-sm shadow-black/50">
      <motion.div
        className="flex whitespace-nowrap gap-16 w-max"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-3">
            <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-tighter truncate max-w-[100px]">{item.name}</span>
            <span className="text-[10px] font-mono font-black text-stone-100">
              {item.price.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              {item.change > 0 ? (
                <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
              ) : item.change < 0 ? (
                <TrendingDown className="w-2.5 h-2.5 text-rose-500" />
              ) : (
                <Minus className="w-2.5 h-2.5 text-stone-700" />
              )}
              <span className={`text-[9px] font-mono font-bold ${item.change > 0 ? 'text-emerald-500' : item.change < 0 ? 'text-rose-500' : 'text-stone-700'}`}>
                {item.change !== 0 ? `${item.change.toFixed(1)}%` : '0.0%'}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}