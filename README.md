# MSB Funding Hub

Sponsorships, grants and personalized outreach for **McMaster School of Bhangra**.

- `data/opportunities.json` — the funding database (edit on GitHub to add/fix entries)
- `scripts/build_seed.py` — the original seed script (don't re-run; it would overwrite auto-found entries)
- A weekly scheduled research job adds new opportunities to `data/opportunities.json` and pushes; Vercel redeploys automatically.

## Run locally
```
npm install
npm run dev
```

## Adding an opportunity
Copy an existing entry in `data/opportunities.json`, give it a unique `slug`, and fill the fields.
Use `"source": "auto-search"` for entries added by the weekly job so they show the **New** badge.
