import { DurableObject } from "cloudflare:workers";
// **DO NOT MODIFY THE CLASS NAME**
export class GlobalDurableObject extends DurableObject {
    // Phase 4: Watchlist Persistence
    async getWatchlist(): Promise<number[]> {
      const watchlist = await this.ctx.storage.get<number[]>("user_watchlist");
      return watchlist || [];
    }
    async toggleWatchlistItem(itemId: number): Promise<number[]> {
      const watchlist = await this.getWatchlist();
      const exists = watchlist.includes(itemId);
      const updated = exists
        ? watchlist.filter(id => id !== itemId)
        : [...watchlist, itemId];
      await this.ctx.storage.put("user_watchlist", updated);
      return updated;
    }
}