# Cloudflare Workers Full-Stack Template

[![[cloudflarebutton]]](https://developers.cloudflare.com/workers/)

A production-ready full-stack application template powered by Cloudflare Workers. Features a modern React frontend with TailwindCSS and shadcn/ui, a Hono-based API backend with Durable Objects for persistent state, and seamless local development with Vite and Bun.

## ✨ Key Features

- **Full-Stack Ready**: React 18 + TypeScript frontend with Vite bundling
- **Cloudflare Workers Backend**: Hono routing with CORS, logging, and error handling
- **Durable Objects**: Built-in persistent storage for counters, lists, and custom state (SQLite-backed)
- **Modern UI**: TailwindCSS v3, shadcn/ui components, dark mode, animations
- **Data Fetching**: TanStack Query integration with automatic API client generation
- **Developer Experience**: Hot reload, TypeScript end-to-end, error boundaries, client error reporting
- **Production Optimized**: Assets SPA handling, Wrangler deployment, observability enabled
- **Demo Endpoints**: `/api/health`, `/api/counter`, `/api/demo` (CRUD with Durable Objects)

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, Lucide Icons, TanStack Query, React Router, Sonner (Toasts), Framer Motion |
| **Backend** | Cloudflare Workers, Hono, Durable Objects (SQLite), CORS |
| **State & Data** | TanStack Query, Zustand, Immer, Durable Objects |
| **UI Utils** | clsx, Tailwind Merge, class-variance-authority (cva) |
| **Dev Tools** | Bun, Wrangler, ESLint, TypeScript 5+, Vite Cloudflare Plugin |
| **Other** | React Hook Form + Zod, Recharts, UUID, Date-fns |

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0+ (recommended package manager)
- [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare account (free tier sufficient)

### Installation

```bash
git clone <your-repo-url>
cd <project-name>
bun install
```

### Local Development

Start the development server (frontend + Workers proxy):

```bash
bun dev
```

- Frontend: http://localhost:3000 (or `${PORT:-3000}`)
- API: http://localhost:3000/api/*
- Hot reload enabled for both frontend and worker

Access demo endpoints:
- `GET /api/health`
- `GET /api/counter`
- `GET /api/demo`
- `POST /api/counter/increment`
- `POST /api/demo` (body: `{ "id": "uuid", "name": "Item", "value": 42 }`)

### Type Generation

Regenerate Worker types for IntelliSense:

```bash
bun cf-typegen
```

## 🔧 Development Workflow

### Project Structure

```
├── src/                 # React frontend (Vite)
├── worker/              # Cloudflare Workers backend (Hono + Durable Objects)
├── shared/              # Shared types and mock data
├── tailwind.config.js   # Tailwind + shadcn/ui config
└── wrangler.jsonc       # Workers deployment config
```

### Adding Routes

Extend `worker/userRoutes.ts` (do **not** edit `worker/index.ts`):

```typescript
// worker/userRoutes.ts
import { userRoutes } from './userRoutes';

app.get('/api/my-endpoint', (c) => c.json({ message: 'Hello!' }));
```

Routes auto-reload in dev mode.

### Custom Durable Objects

Edit `worker/durableObject.ts` methods and use via `c.env.GlobalDurableObject.idFromName('global')`.

### Frontend Customization

- Replace `src/pages/HomePage.tsx`
- Add routes in `src/main.tsx`
- Use shadcn/ui components from `@/components/ui/*`
- Hooks: `useTheme`, `useMobile`
- Layouts: `AppLayout` (with sidebar)

### UI Components

shadcn/ui pre-installed. Add new ones:

```bash
npx shadcn@latest add <component>
```

## ☁️ Deployment

Deploy to Cloudflare Workers with Pages for static assets:

```bash
bun deploy
```

Or manually:

```bash
bun build    # Builds frontend to dist/
wrangler deploy
```

**One-Click Deploy**:

[![[cloudflarebutton]]](https://developers.cloudflare.com/workers/)

### Configuration

- `wrangler.jsonc`: Assets SPA handling (`/api/*` routes to Worker)
- Durable Objects auto-migrate (`v1` tag)
- Observability enabled (logs, metrics)

### Environment Variables

Set via Wrangler dashboard or CLI:

```bash
wrangler secret put MY_SECRET
```

Bindings available in `worker/core-utils.ts`.

## 📚 Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start dev server (frontend + API proxy) |
| `bun build` | Build frontend for production |
| `bun lint` | Run ESLint |
| `bun preview` | Preview production build |
| `bun deploy` | Build + deploy to Cloudflare |
| `bun cf-typegen` | Generate Worker types |

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`bun dev`)
3. Commit changes (`git commit -m 'feat: ...'`)
4. Push and open PR

## 🔮 Next Steps

- Integrate authentication (e.g., Cloudflare Access)
- Add Workers KV/R2 bindings
- Deploy frontend separately to Cloudflare Pages
- Extend Durable Objects for multi-tenant apps

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

⭐ **Built with [Cloudflare Workers](https://workers.cloudflare.com/) · Questions? [Join Discord](https://discord.gg/cloudflaredev)**