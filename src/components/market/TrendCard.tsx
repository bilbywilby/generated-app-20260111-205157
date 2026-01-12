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
    <Card className="bg-stone-900/40 border-stone-800 shadow-xl overflow-hidden group/card">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 space-y-0 border-b border-stone-800/50">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
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
                className="w-full flex items-center justify-between p-3 hover:bg-stone-800/50 transition-all group relative overflow-hidden active:bg-stone-800"
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 flex items-center justify-center bg-stone-950 border border-stone-800 rounded-lg group-hover:border-amber-500/30 transition-colors">
                    <img
                      src={getItemIconUrl(detail.name)}
                      alt={detail.name}
                      className="w-7 h-7 object-contain drop-shadow-md group-hover:scale-125 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0.3';
                      }}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-200 truncate w-32 group-hover:text-white transition-colors">
                      {detail.name}
                    </p>
                    {item.subValue && (
                      <p className="text-[10px] font-mono text-stone-500 group-hover:text-stone-400">
                        {item.subValue}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className={cn(
                    "text-xs font-mono font-bold px-2 py-0.5 rounded",
                    item.isPositive === true ? "text-emerald-400 bg-emerald-500/5" :
                    item.isPositive === false ? "text-rose-400 bg-rose-500/5" : "text-amber-400 bg-amber-500/5"
                  )}>
                    {typeof item.value === 'number' ? `${item.value.toLocaleString()}` : item.value}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-800/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}