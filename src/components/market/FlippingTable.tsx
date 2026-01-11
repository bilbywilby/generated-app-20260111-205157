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
import { formatGP, cn, getItemIconUrl, isSinkItem, isDumpItem } from '@/lib/utils';
import { calculateAlchProfit } from '@/lib/osrs-api';
import { ArrowUpDown, AlertCircle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
interface FlippingTableProps {
  data: any[];
}
export function FlippingTable({ data }: FlippingTableProps) {
  const items = useMarketStore(s => s.items);
  const setSelectedId = useMarketStore(s => s.setSelectedItemId);
  const naturePrice = useMarketStore(s => s.naturePrice);
  const filters = useMarketStore(s => s.flippingFilters);
  const latest1hPrices = useMarketStore(s => s.latest1hPrices);
  const previous1hPrices = useMarketStore(s => s.previous1hPrices);
  const hideSinkItems = filters.hideSinkItems;
  const [sortKey, setSortKey] = React.useState('profit');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const processedData = React.useMemo(() => {
    const filtered = hideSinkItems ? data.filter(row => !isSinkItem(row.id)) : data;
    return filtered.map(row => {
      const itemDetails = items[row.id];
      const alch = itemDetails
        ? calculateAlchProfit(itemDetails.highalch || 0, row.low, naturePrice)
        : { profit: 0, roi: 0 };
      const isDump = isDumpItem(latest1hPrices[row.id], previous1hPrices[row.id]);
      return { ...row, alch, isDump };
    });
  }, [data, items, naturePrice, hideSinkItems, latest1hPrices, previous1hPrices]);
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
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-stone-950/80 sticky top-0 z-10">
            <TableRow className="border-stone-800 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3">Item</TableHead>
              <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-center">Status</TableHead>
              <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-right cursor-pointer group" onClick={() => handleSort('buy')}>
                Buy <ArrowUpDown className="inline w-2.5 h-2.5 ml-1 group-hover:text-amber-500" />
              </TableHead>
              <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-right cursor-pointer group" onClick={() => handleSort('sell')}>
                Sell <ArrowUpDown className="inline w-2.5 h-2.5 ml-1 group-hover:text-amber-500" />
              </TableHead>
              <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-right cursor-pointer group" onClick={() => handleSort('profit')}>
                Profit <ArrowUpDown className="inline w-2.5 h-2.5 ml-1 group-hover:text-amber-500" />
              </TableHead>
              <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-right cursor-pointer group" onClick={() => handleSort('alch')}>
                Alch <ArrowUpDown className="inline w-2.5 h-2.5 ml-1 group-hover:text-amber-500" />
              </TableHead>
              <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-right cursor-pointer group" onClick={() => handleSort('roi')}>
                ROI% <ArrowUpDown className="inline w-2.5 h-2.5 ml-1 group-hover:text-amber-500" />
              </TableHead>
              <TableHead className="text-[10px] uppercase font-mono font-bold text-stone-500 h-8 px-3 text-right cursor-pointer group" onClick={() => handleSort('volume')}>
                Vol <ArrowUpDown className="inline w-2.5 h-2.5 ml-1 group-hover:text-amber-500" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row) => {
              const item = items[row.id];
              if (!item) return null;
              const isSink = isSinkItem(row.id);
              return (
                <TableRow
                  key={row.id}
                  className="border-stone-800/50 hover:bg-stone-900/50 cursor-pointer transition-colors group"
                  onClick={() => setSelectedId(row.id)}
                >
                  <TableCell className="py-1.5 px-3">
                    <div className="flex items-center gap-2 max-w-[180px]">
                      <div className="w-6 h-6 flex items-center justify-center bg-stone-950 border border-stone-800 rounded shrink-0">
                        <img src={getItemIconUrl(item.name, item.id)} alt="" className="w-4 h-4 object-contain opacity-80 group-hover:scale-110" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-stone-200 truncate">{item.name}</span>
                        {isSink && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] h-3.5 px-1 w-fit mt-0.5">SINK</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-3 text-center">
                    {row.isDump && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[8px] h-4 px-1 cursor-help hover:bg-amber-500 hover:text-black transition-colors">
                            DUMP
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="bg-stone-900 border-stone-800 text-[10px] p-2">
                          Vol spike + 10% drop—bot/panic opportunity detected.
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-1.5 px-3 font-mono text-[11px] text-rose-400/90">{row.low.toLocaleString()}</TableCell>
                  <TableCell className="text-right py-1.5 px-3 font-mono text-[11px] text-emerald-400/90">{row.high.toLocaleString()}</TableCell>
                  <TableCell className="text-right py-1.5 px-3 font-mono text-[11px] font-bold text-emerald-500">{row.margin.profit.toLocaleString()}</TableCell>
                  <TableCell className="text-right py-1.5 px-3 font-mono text-[11px]">
                    <div className={cn("font-bold", row.alch.profit > 0 ? "text-amber-400" : "text-stone-600")}>
                      {row.alch.profit.toLocaleString()}
                    </div>
                    <div className="text-[9px] opacity-40">{row.alch.roi.toFixed(1)}%</div>
                  </TableCell>
                  <TableCell className="text-right py-1.5 px-3 font-mono text-[11px] text-emerald-400">{row.margin.roi.toFixed(1)}%</TableCell>
                  <TableCell className="text-right py-1.5 px-3 font-mono text-[11px] text-stone-500">{formatGP(row.volume)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}