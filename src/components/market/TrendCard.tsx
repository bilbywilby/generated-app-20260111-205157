import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMarketStore } from '@/store/market-store';
import { cn, getItemIconUrl } from '@/lib/utils';
interface TrendItem {
  id: number;
  value: string | number;
  subValue?: string;
  isPositive?: boolean;
}
interface TrendCardProps {
  title: string;
  icon: React.ReactNode;
  items: TrendItem[];
  onSelect: (id: number) => void;
}
export function TrendCard({ title, icon, items, onSelect }: TrendCardProps) {
  const itemsMap = useMarketStore(s => s.items);
  return (
    <Card className="bg-stone-900/30 border-stone-800/60 shadow-lg overflow-hidden transition-all duration-300">
      <CardHeader className="py-2.5 px-4 space-y-0 border-b border-stone-800/40 bg-stone-950/20">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500 flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-stone-800/30">
          {items.map((item) => {
            const detail = itemsMap[item.id];
            if (!detail) return null;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="w-full flex items-center justify-between p-2.5 px-4 hover:bg-stone-800/40 transition-all group relative overflow-hidden active:bg-stone-800"
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 flex items-center justify-center bg-stone-950 border border-stone-800/60 rounded group-hover:border-amber-500/20 transition-colors">
                    <img
                      src={getItemIconUrl(detail.name, detail.id)}
                      alt=""
                      className="w-5 h-5 object-contain opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-stone-200 truncate w-24 group-hover:text-white">
                      {detail.name}
                    </p>
                    {item.subValue && (
                      <p className="text-[9px] font-mono text-stone-500 group-hover:text-stone-400">
                        {item.subValue}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className={cn(
                    "text-[10px] font-mono font-black px-2 py-0.5 rounded border border-transparent transition-all",
                    item.isPositive === true ? "text-emerald-500 bg-emerald-500/5 group-hover:border-emerald-500/20" :
                    item.isPositive === false ? "text-rose-500 bg-rose-500/5 group-hover:border-rose-500/20" : "text-amber-500 bg-amber-500/5 group-hover:border-amber-500/20"
                  )}>
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}