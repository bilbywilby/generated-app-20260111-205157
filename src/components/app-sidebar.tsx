import React from "react";
import { Home, Zap, Database, Terminal, Star, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useMarketStore } from "@/store/market-store";
import { cn } from "@/lib/utils";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const latest1hPrices = useMarketStore(s => s.latest1hPrices);
  const previous1hPrices = useMarketStore(s => s.previous1hPrices);
  const watchlist = useMarketStore(s => s.watchlist);
  const activeTrades = React.useMemo(() =>
    Object.values(latest1hPrices).filter(d => (d.highPriceVolume + d.lowPriceVolume) > 0).length
  , [latest1hPrices]);
  const marketSentiment = React.useMemo(() => {
    let gainers = 0;
    let losers = 0;
    Object.entries(latest1hPrices).forEach(([id, curr]) => {
      const prev = previous1hPrices[parseInt(id)];
      if (prev?.avgHighPrice && curr?.avgHighPrice) {
        if (curr.avgHighPrice > prev.avgHighPrice) gainers++;
        else if (curr.avgHighPrice < prev.avgHighPrice) losers++;
      }
    });
    const total = gainers + losers;
    return total > 0 ? (gainers / total) * 100 : 50;
  }, [latest1hPrices, previous1hPrices]);
  return (
    <Sidebar className="border-r border-stone-800 bg-[#0c0a09]">
      <SidebarHeader className="h-14 border-b border-stone-800 flex flex-row items-center px-4 gap-3">
        <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center shrink-0">
          <Terminal className="text-black w-4 h-4" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white uppercase">
          RUNE<span className="text-amber-500">TERMINAL</span>
        </span>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-stone-600 uppercase tracking-widest px-4 py-2">Terminal</SidebarGroupLabel>
          <SidebarMenu className="px-2 space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/"} className="h-9">
                <Link to="/">
                  <Home className="w-4 h-4" />
                  <span className="text-xs font-medium">Market Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/flipping"} className="h-9">
                <Link to="/flipping">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-medium">Tactical Flipping</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/items"} className="h-9">
                <Link to="/items">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-medium">Price Database</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-bold text-stone-600 uppercase tracking-widest px-4 py-2">Market Vitals</SidebarGroupLabel>
          <div className="px-4 py-2 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-500 uppercase">Sentiment</span>
                <span className={cn(marketSentiment > 50 ? "text-emerald-500" : "text-rose-500")}>
                  {marketSentiment > 55 ? "BULLISH" : marketSentiment < 45 ? "BEARISH" : "NEUTRAL"}
                </span>
              </div>
              <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", marketSentiment > 50 ? "bg-emerald-500" : "bg-rose-500")} 
                  style={{ width: `${marketSentiment}%` }} 
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-stone-500 uppercase">Active Trades</span>
              <span className="text-white">{activeTrades.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-stone-500 uppercase">Watchlist</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                <span className="text-white">{watchlist.length}</span>
              </div>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-stone-800">
        <div className="flex items-center gap-2 text-[10px] text-stone-600 font-mono">
          <Activity className="w-3 h-3 text-emerald-500" />
          SYSTEM NOMINAL
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}