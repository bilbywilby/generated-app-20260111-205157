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
    let gainers = 0, losers = 0;
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
    <Sidebar className="border-r border-stone-800 bg-[#0c0a09] transition-all duration-300">
      <SidebarHeader className="h-11 border-b border-stone-800/60 flex flex-row items-center px-4 gap-2.5">
        <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
          <Terminal className="text-black w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-black tracking-tight text-white uppercase flex items-baseline gap-0.5">
          RUNE<span className="text-amber-500">TERMINAL</span>
        </span>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-bold text-stone-600 uppercase tracking-widest px-4 py-1.5 mb-1">Index Navigation</SidebarGroupLabel>
          <SidebarMenu className="px-2 space-y-0.5">
            {[
              { to: "/", icon: Home, label: "Market Dashboard" },
              { to: "/flipping", icon: Zap, label: "Tactical Flipping" },
              { to: "/items", icon: Database, label: "Asset Database" }
            ].map((link) => (
              <SidebarMenuItem key={link.to}>
                <SidebarMenuButton asChild isActive={location.pathname === link.to} className="h-8 transition-colors hover:bg-stone-900/50">
                  <Link to={link.to}>
                    <link.icon className={cn("w-3.5 h-3.5", location.pathname === link.to ? "text-amber-500" : "text-stone-500")} />
                    <span className="text-[11px] font-bold">{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[9px] font-bold text-stone-600 uppercase tracking-widest px-4 py-1.5 mb-2">Market Vitals</SidebarGroupLabel>
          <div className="px-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-tight">
                <span className="text-stone-500">Sentiment</span>
                <span className={cn(marketSentiment > 50 ? "text-emerald-500" : "text-rose-500")}>
                  {marketSentiment > 55 ? "BULLISH" : marketSentiment < 45 ? "BEARISH" : "NEUTRAL"}
                </span>
              </div>
              <div className="h-1 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-800/30">
                <div
                  className={cn("h-full transition-all duration-1000 ease-in-out", marketSentiment > 50 ? "bg-emerald-500" : "bg-rose-500")}
                  style={{ width: `${marketSentiment}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between text-[9px] font-mono font-bold border-b border-stone-900 pb-1.5">
                <span className="text-stone-500 uppercase">Active Trade</span>
                <span className="text-stone-100">{activeTrades.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono font-bold border-b border-stone-900 pb-1.5">
                <span className="text-stone-500 uppercase">In Watchlist</span>
                <div className="flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500/20" />
                  <span className="text-stone-100">{watchlist.length}</span>
                </div>
              </div>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-stone-800/60 bg-stone-950/40">
        <div className="flex items-center gap-2 text-[9px] text-stone-500 font-mono font-bold uppercase tracking-tighter">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-pulse shrink-0" />
          System Nominal
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}