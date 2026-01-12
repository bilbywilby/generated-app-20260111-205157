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
import { formatGP } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
interface FlippingTableProps {
  data: any[];
}
export function FlippingTable({ data }: FlippingTableProps) {
  const items = useMarketStore(s => s.items);
  const setSelectedId = useMarketStore(s => s.setSelectedItemId);
  const [sortKey, setSortKey] = React.useState('profit');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let valA, valB;
      if (sortKey === 'profit') { valA = a.margin.profit; valB = b.margin.profit; }
      else if (sortKey === 'roi') { valA = a.margin.roi; valB = b.margin.roi; }
      else if (sortKey === 'volume') { valA = a.volume; valB = b.volume; }
      else { valA = a.high; valB = b.high; }
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  }, [data, sortKey, sortDir]);
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };
  return (
    <Table>
      <TableHeader className="bg-stone-950/50">
        <TableRow className="border-stone-800 hover:bg-transparent">
          <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10">Item</TableHead>
          <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer" onClick={() => handleSort('buy')}>Buy (Low) <ArrowUpDown className="inline w-3 h-3 ml-1" /></TableHead>
          <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer" onClick={() => handleSort('sell')}>Sell (High) <ArrowUpDown className="inline w-3 h-3 ml-1" /></TableHead>
          <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer" onClick={() => handleSort('profit')}>Net Profit <ArrowUpDown className="inline w-3 h-3 ml-1" /></TableHead>
          <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer" onClick={() => handleSort('roi')}>ROI% <ArrowUpDown className="inline w-3 h-3 ml-1" /></TableHead>
          <TableHead className="text-[10px] uppercase font-bold text-stone-500 h-10 text-right cursor-pointer" onClick={() => handleSort('volume')}>Vol (1h) <ArrowUpDown className="inline w-3 h-3 ml-1" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.length > 0 ? (
          sortedData.map((row) => {
            const item = items[row.id];
            return (
              <TableRow 
                key={row.id} 
                className="border-stone-800 hover:bg-stone-800/30 cursor-pointer transition-colors group"
                onClick={() => setSelectedId(row.id)}
              >
                <TableCell className="py-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://static.runescape.wiki/images/${item.name.replace(/ /g, '_')}_detail.png`} 
                      alt="" 
                      className="w-6 h-6 object-contain opacity-80 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-bold text-stone-200">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-2 font-mono text-xs text-rose-400">{row.low.toLocaleString()}</TableCell>
                <TableCell className="text-right py-2 font-mono text-xs text-emerald-400">{row.high.toLocaleString()}</TableCell>
                <TableCell className="text-right py-2 font-mono text-xs font-bold text-emerald-500">{row.margin.profit.toLocaleString()}</TableCell>
                <TableCell className="text-right py-2 font-mono text-xs text-emerald-400">{row.margin.roi.toFixed(1)}%</TableCell>
                <TableCell className="text-right py-2 font-mono text-xs text-stone-400">{formatGP(row.volume)}</TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-xs text-stone-600">
              No opportunities match your current filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}