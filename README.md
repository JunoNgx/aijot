# ai\*jot

A minimalist keyboard-first note-taking Progressive Web App, tailored for fast operations and data-privacy. A sequel to [JustJot](https://github.com/JunoNgx/justjot-frontend).

## Production deployment

The application is currently deployed at [aijot.app](https://aijot.app/) via Vercel.

## Features

- Keyboard-first philosophy and workflow
- Powerful main input that handles both search and quick data creation
- Three item types: text, todo, link/bookmark
- Dynamic filter-based collection system
- Privacy-focused; data exists only on area where user has control over
- Local-first: works without internet connection; changes are immediate

## Tech stack

- React via Vite
- Dexie/IndexedDB
- Zustand + TanStack Query
- Google Drive API (optional)
- CodeMirror 6

- Hono (backend)

## CSS

The project's CSS uses [BEM convention](https://getbem.com/naming/) for elements' classnames with `PascalCase`, inheriting the convention used in JustJot.

```
JotItem__PrimaryText--Selected
```

This convention has improved (subjective) readability without any encountered issue. This remains in the codebase as of time of writing.

## Environment variables

Refer to `.env.example` in the root directory (for frontend) and in `/api` (for backend), respectively.

In Vercel deployment, all environment variables are merged and shared in the project's single dashboard.

## Local development

- Frontend: `pnpm dev` (Vite, port 5173)
- Backend: `pnpm --filter @aijot/backend dev` (tsx, port 3000)
- Vite proxies `/api` to `localhost:3000` during dev
- As a shorthand, run `pnpm dev:all` to run both

## Contribution

For bug reporting, issues, and design suggestions, please open new issues on GitHub.

## Third-Party Licenses

**Monkey Type**

Theme definitions used under the following license:

- **Source**: https://github.com/monkeytypegame/monkeytype
- **License**: GNU General Public License v3 (GPLv3)
- **Copyright**: Monkey Type contributors

**Standard Book**

- **Source**: https://github.com/brycewilner/Standard
- **License**: SIL Open Font License v1.1
- **Copyright**: Bryce Wilner
