# Contributing to GIGASCOPE

Thanks for your interest in contributing!

## How to Help

### 1. Submit Data Updates
The easiest way to contribute — no coding required.

- Go to [Issues → New Issue → Factory Data Update](https://github.com/sincetwentytwo-sys/gigascope/issues/new?template=data-update.yml)
- Select the factory, provide updated numbers, and include a source link
- We'll review and merge the update

### 2. Update Factory Data Directly
Factory data is stored in `public/data/factories.json`. To update:

1. Fork this repo
2. Edit `public/data/factories.json` with your changes
3. Submit a Pull Request with a source link for verification

The JSON structure per factory:
```json
{
  "id": "giga-texas",
  "progress": 78,
  "lastUpdated": "2026-04-05",
  "milestones": [
    { "date": "2026-H2", "text": "Phase 3 expansion complete", "done": false }
  ]
}
```

### 3. Report Bugs or Request Features
Use the issue templates:
- [Bug Report](https://github.com/sincetwentytwo-sys/gigascope/issues/new?template=bug-report.yml)
- [Feature Request](https://github.com/sincetwentytwo-sys/gigascope/issues/new?template=feature-request.yml)

## Development

```bash
git clone https://github.com/sincetwentytwo-sys/gigascope.git
cd gigascope
npm install
npm run dev
```

## Guidelines

- Keep data updates factual — always include a source
- One change per PR
- Test locally before submitting
