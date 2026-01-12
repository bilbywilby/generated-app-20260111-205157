import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMarketStore } from '@/store/market-store';
import { formatGP, cn, getItemIconUrl, isSinkItem } from '@/lib/utils';
import { calculateAlchProfit } from '@/lib/osrs-api';
import { ArrowUpDown, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
interface FlippingTableProps {
  data: any[];
}
export function FlippingTable({ data }: FlippingTableProps) {
  const items = useMarketStore(s => s.items);
  const setSelectedId = useMarketStore(s => s.setSelectedItemId);
  const naturePrice = useMarketStore(s => s.naturePrice);
  const hideSinkItems = useMarketStore(s => s.flippingFilters.hideSinkItems);
  const [sortKey, setSortKey] = React.useState('profit');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const processedData = React.useMemo(() => {
    const filtered = hideSinkItems ? data.filter(row => !isSinkItem(row.id)) : data;
    return filtered.map(row => {
      const itemDetails = items[row.id];
      const alch = itemDetails 
        ? calculateAlchProfit(itemDetails.highalch || 0, row.low, naturePrice)
        : { profit: 0, roi: 0 };
      return { ...row, alch };
    });
  }, [data, items, naturePrice, hideSinkItems]);
  const sortedData = React.useMemo(() => {
    return [...processedData].sort((a, b) => {
      let valA, valB;
      if (sortKey === 'profit') { valA = a.margin.profit; valB = b.margin.profit; }
      else if (sortKey === 'roi') { valA = a.margin.roi; valB = b.margin.roi; }
      else if (sortKey === 'volume') { valA = a.volume; valB = b.volume; }
      else if (sortKey === 'alch') { valA = a.alch.profit; valB = b.alch.profit; }
      else if (sortKey === 'buy') { valA = a.low; valB = b.low; }
      else { valA = a.high; valB = b.high; }
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  }, [processedData, sortKey, sortDir]);
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };
  return (
    <TooltipProvider>
      <Table>
        <TableHeader className="bg-stone-950/50">
          <TableRow className="border-stone-800 hover:bg-transparent">
            <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10">Item</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer group" onClick={() => handleSort('buy')}>
              Buy (Low) <ArrowUpDown className="inline w-3 h-3 ml-1 group-hover:text-amber-500 transition-colors" />
            </TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer group" onClick={() => handleSort('sell')}>
              Sell (High) <ArrowUpDown className="inline w-3 h-3 ml-1 group-hover:text-amber-500 transition-colors" />
            </TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer group" onClick={() => handleSort('profit')}>
              Net Profit <ArrowUpDown className="inline w-3 h-3 ml-1 group-hover:text-amber-500 transition-colors" />
            </TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer group" onClick={() => handleSort('alch')}>
              Alch Profit <ArrowUpDown className="inline w-3 h-3 ml-1 group-hover:text-amber-500 transition-colors" />
            </TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer group" onClick={() => handleSort('roi')}>
              ROI% <ArrowUpDown className="inline w-3 h-3 ml-1 group-hover:text-amber-500 transition-colors" />
            </TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer group" onClick={() => handleSort('volume')}>
              Vol (1h) <ArrowUpDown className="inline w-3 h-3 ml-1 group-hover:text-amber-500 transition-colors" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((row) => {
              const item = items[row.id];
              if (!item) return null;
              const isSink = isSinkItem(row.id);
              return (
                <TableRow
                  key={row.id}
                  className="border-stone-800 hover:bg-stone-800/30 cursor-pointer transition-all duration-200 group"
                  onClick={() => setSelectedId(row.id)}
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-stone-950 border border-stone-800 rounded group-hover:border-amber-500/30 transition-colors shrink-0">
                        <img
                          src={getItemIconUrl(item.name)}
                          alt=""
                          className="w-6 h-6 object-contain opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-stone-200 truncate">{item.name}</span>
                        {isSink && (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[8px] h-3 px-1 w-fit mt-0.5 leading-none">
                            SINK
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 font-mono text-xs text-rose-400">{row.low.toLocaleString()}</TableCell>
                  <TableCell className="text-right py-2 font-mono text-xs text-emerald-400">{row.high.toLocaleString()}</TableCell>
                  <TableCell className="text-right py-2 font-mono text-xs font-bold text-emerald-500">{row.margin.profit.toLocaleString()}</TableCell>
                  <TableCell className="text-right py-2 font-mono text-xs">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={cn(
                          "flex items-center justify-end gap-1 font-bold",
                          row.alch.profit > 0 ? "text-amber-400" : "text-stone-600"
                        )}>
                          {row.alch.profit.toLocaleString()}
                          <Info className="w-2.5 h-2.5 opacity-50" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-stone-900 border-stone-800 text-[10px] text-stone-200">
                        Alch ({item.highalch?.toLocaleString()} gp) - Buy ({row.low.toLocaleString()} gp) - Nature ({naturePrice} gp)
                      </TooltipContent>
                    </Tooltip>
                    <div className={cn("text-[9px] opacity-60 font-mono", row.alch.roi > 0 ? "text-amber-400" : "text-stone-600")}>
                      {row.alch.roi.toFixed(1)}% ROI
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 font-mono text-xs text-emerald-400">{row.margin.roi.toFixed(1)}%</TableCell>
                  <TableCell className="text-right py-2 font-mono text-xs text-stone-400">{formatGP(row.volume)}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-xs text-stone-600 italic">
                Scanning market... No opportunities match your current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}