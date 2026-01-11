import React from 'react';
import { motion } from 'framer-motion';
import { useMarketStore } from '@/store/market-store';
import { TrendingUp, TrendingDown } from 'lucide-react';
interface TickerProps {
  prices: Record<string, { high: number; low: number }>;
}
export function MarketTicker({ prices }: TickerProps) {
  const items = useMarketStore(s => s.items);
  const itemIds = useMarketStore(s => s.itemIds);
  // Take a slice of high-volume/interesting items for the ticker
  const tickerItems = React.useMemo(() => {
    return itemIds.slice(0, 20).map(id => ({
      id,
      name: items[id]?.name,
      price: prices[id.toString()]?.high || 0,
    })).filter(i => i.price > 0);
  }, [items, itemIds, prices]);
  return (
    <div className="w-full overflow-hidden bg-stone-950 border-y border-stone-800 py-2">
      <motion.div
        className="flex whitespace-nowrap gap-12"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase">{item.name}</span>
            <span className="text-xs font-mono font-bold text-amber-500">
              {item.price.toLocaleString()} gp
            </span>
            {idx % 2 === 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-500" />
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}