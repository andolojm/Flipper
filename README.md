# Flipper

A set of Grand Exchange hijinks for Old School RuneScape. Built on the [OSRS Wiki Real-time Prices API](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices).

## Stack 🥞

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) for UI

## Getting started

```bash
npm install
npm run dev
```

## Vibe coding on the bus to work starter pack

```bash
claude remote-control
cloudflared tunnel --url http://localhost:5173
npm run dev -- --host
```