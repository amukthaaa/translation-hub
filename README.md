# Copeland Translation Request Hub (Prototype)

A prototype built against the PRD for a translation request/tracking tool: request submission, a status dashboard with overdue/language filtering, automatic glossary term flagging with per-language translation coverage, a request detail view with source text + context screenshot, and a backlog tab.

No backend — all data is mock JSON in `src/data/`. New requests submitted through the form are held in memory only (context state) and reset on page reload.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Static Vite build, deployable to Vercel as-is:

```bash
npm run build
```
