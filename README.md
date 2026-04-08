# RS Financials — Rosemary Schafer Dashboard

A premium financial dashboard for Rosemary Schafer's personal and trust accounts. Built with React, Vite, Tailwind CSS, and Chart.js.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

Create `.env.local` for local development:
```
VITE_API_BASE_URL=http://localhost:3000
```

For Vercel deployment, set these in the Vercel dashboard:
```
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=anthropic/claude-sonnet-4-6
```

**Important:** `OPENROUTER_API_KEY` must NOT have a `VITE_` prefix — it only lives server-side.

## Updating the Excel File

Replace the file at `public/data/2025_Rose_NEW_and_IMPROVED_Financials.xlsx` with the updated version, or use the Upload button in the dashboard to load a new file at runtime.

## Data Parsing

All financial data is parsed at runtime from the Excel file using SheetJS. The parsing logic lives in `src/data/dataService.js`. No dollar amounts are hardcoded — everything is extracted programmatically from the "RS P&L - 2025" sheet.

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Set environment variables (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`)
4. Deploy — Vercel auto-detects Vite
