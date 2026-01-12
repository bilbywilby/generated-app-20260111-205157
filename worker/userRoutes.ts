import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'RuneTerminal API' }}));
    // Watchlist Endpoints
    app.get('/api/watchlist', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getWatchlist();
        return c.json({ success: true, data } satisfies ApiResponse<number[]>);
    });
    app.post('/api/watchlist/toggle', async (c) => {
        const body = await c.req.json() as { itemId: number };
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.toggleWatchlistItem(body.itemId);
        return c.json({ success: true, data } satisfies ApiResponse<number[]>);
    });
}