import React, { useEffect, useMemo } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useQuery } from '@tanstack/react-query';
import { fetchItemMapping, fetchLatestPrices, fetch1hPrices, HourlyPriceData, getNaturePrice } from '@/lib/osrs-api';
import { useMarketStore } from '@/store/market-store';
import { ItemSearch } from '@/components/market/ItemSearch';
import { ItemDetailSheet } from '@/components/market/ItemDetailSheet';
import { Activity, Database, Zap, AlertTriangle } from 'lucide-react';
import { isDumpItem } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
};
export function AppLayout({ children, container = false }: AppLayoutProps): JSX.Element {
  const setItems = useMarketStore(s => s.setItems);
  const setLoading = useMarketStore(s => s.setLoading);
  const updateHourlyPrices = useMarketStore(s => s.updateHourlyPrices);
  const setNaturePrice = useMarketStore(s => s.setNaturePrice);
  const naturePriceValue = useMarketStore(s => s.naturePrice);
  const itemsCount = useMarketStore(s => s.itemIds.length);
  const latest1hPrices = useMarketStore(s => s.latest1hPrices);
  const previous1hPrices = useMarketStore(s => s.previous1hPrices);
  const { data: itemMappingData } = useQuery({
    queryKey: ['itemMapping'],
    queryFn: fetchItemMapping,
    staleTime: Infinity,
  });
  useEffect(() => {
    if (itemMappingData) {
      setItems(itemMappingData);
      setLoading(false);
    }
  }, [itemMappingData, setItems, setLoading]);
  const { data: latestPrices } = useQuery({
    queryKey: ['latestPrices'],
    queryFn: fetchLatestPrices,
    refetchInterval: 30000,
  });
  useEffect(() => {
    if (latestPrices) {
      const price = getNaturePrice(latestPrices);
      setNaturePrice(price);
    }
  }, [latestPrices, setNaturePrice]);
  const { data: hourlyData } = useQuery({
    queryKey: ['1hPrices'],
    queryFn: fetch1hPrices,
    refetchInterval: 300000,
  });
  useEffect(() => {
    if (hourlyData) {
      const parsed: Record<number, HourlyPriceData> = {};
      Object.entries(hourlyData).forEach(([id, data]) => {
        parsed[parseInt(id)] = data;
      });
      updateHourlyPrices(parsed);
    }
  }, [hourlyData, updateHourlyPrices]);
  const activeDumpCount = useMemo(() => {
    return Object.entries(latest1hPrices).filter(([id, data]) => 
      isDumpItem(data, previous1hPrices[parseInt(id)])
    ).length;
  }, [latest1hPrices, previous1hPrices]);
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-[#0c0a09] flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-[#0c0a09]/90 backdrop-blur-xl border-b border-stone-800/60 h-11 flex items-center px-4 justify-between shadow-sm shadow-amber-500/5">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-7 w-7" />
            <div className="h-3 w-px bg-stone-800" />
            <ItemSearch />
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            {activeDumpCount > 3 && (
              <Badge variant="destructive" className="animate-pulse bg-rose-600/20 border-rose-600/40 text-rose-500 text-[9px] h-6 flex gap-1.5 items-center px-2">
                <AlertTriangle className="w-3 h-3" />
                {activeDumpCount}+ DUMPS ACTIVE
              </Badge>
            )}
            <div className="flex items-center gap-1.5 text-amber-500 font-bold">
               <Zap className="w-3 h-3" />
               NATURE: {naturePriceValue > 0 ? `${naturePriceValue} GP` : '...'}
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold uppercase tracking-tight">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-pulse" />
              Live Feed
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className={container ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8" : ""}>
            {children}
          </div>
        </main>
        <footer className="h-7 border-t border-stone-800/60 bg-stone-950 flex items-center justify-between px-4 text-[9px] font-mono text-stone-500 uppercase tracking-widest shadow-inner shadow-amber-500/[0.02]">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Database className="w-2.5 h-2.5" /> {itemsCount.toLocaleString()} SECS
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-2.5 h-2.5" /> 30S POLLING
            </span>
          </div>
          <div className="opacity-60">RUNE-TERMINAL CORE v1.0.9-STABLE</div>
        </footer>
        <ItemDetailSheet prices={latestPrices || {}} />
      </SidebarInset>
    </SidebarProvider>
  );
}