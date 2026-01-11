import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMarketStore } from '@/store/market-store';
import { cn } from '@/lib/utils';
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
  const marketItems = useMarketStore(s => s.items);
  return (
    <Card className="bg-stone-900/50 border-stone-800 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 space-y-0">
        <CardTitle className="text-sm font-medium text-stone-200 flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="space-y-1">
          {items.map((item) => {
            const detail = marketItems[item.id];
            if (!detail) return null;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="w-full flex items-center justify-between p-2 hover:bg-stone-800/50 rounded-md transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-stone-800 rounded group-hover:bg-stone-700 transition-colors">
                    <img 
                      src={`https://static.runescape.wiki/images/${detail.name.replace(/ /g, '_')}_detail.png`} 
                      alt={detail.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-stone-300 truncate w-32">{detail.name}</p>
                    {item.subValue && <p className="text-[10px] text-stone-500">{item.subValue}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-xs font-mono font-bold",
                    item.isPositive === true ? "text-emerald-500" : 
                    item.isPositive === false ? "text-rose-500" : "text-amber-500"
                  )}>
                    {typeof item.value === 'number' ? `${item.value.toLocaleString()}` : item.value}
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