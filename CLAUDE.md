# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio and CV site for Junho Heo (4season) at junho.art. Static vanilla HTML/CSS/JS — no build step, no framework, no package.json. The only Node.js script is `update_pinned.js`, which runs on an Oracle VM server as a cron job and is not part of the frontend.

## Running locally

Open `index.html` directly in a browser, or serve with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Architecture

### Pages

- `index.html` + `index_en.html` — Korean and English versions of the portfolio, kept in sync manually. Sections: `#about`, `#journey`, `#skills`, `#projects`.
- `signature.html` — standalone email signature / business card generator. **Self-contained**: all interaction logic lives in an inline `<script>` at the bottom of the file (not in `script.js`). Default field values (name, email, phone, research interests, profile URL) are set directly in the `<input value="">` attributes and in JS element caches at the top of the script.
- All three pages share `style.css`. `index.html` and `index_en.html` also share `script.js`; `signature.html` does not use `script.js`.

### Dynamic GitHub projects (`script.js`)

`pinned-repos.json` is written by the cron job on the server and served as a static file. `script.js` fetches it with a timestamp cache-buster and re-fetches every 5 minutes. Key functions:

- `loadGitHubProjects()` — fetches JSON, falls back to `DEFAULT_PROJECTS` on failure.
- `renderProjects(projects)` — builds project cards; applies `PROJECT_IMAGES` and `PROJECT_DESCRIPTIONS` overrides per repo name.
- `initScrollRevealFallback()` — `IntersectionObserver` fallback for browsers without `view-timeline`.
- `updateTimelineProgress()` / `cacheTimelineLayout()` — scroll-driven progress indicator on the journey timeline.

### Server-side sync (`update_pinned.js`)

Zero-dependency Node.js script. Run on Oracle VM:

```bash
GITHUB_TOKEN="<token>" node update_pinned.js /path/to/web_root/pinned-repos.json
```

Cron (every 30 min):

```bash
*/30 * * * * GITHUB_TOKEN="<token>" node /path/to/update_pinned.js /path/to/pinned-repos.json >> /path/to/cron_log.log 2>&1
```

## Key conventions

- **Korean/English parity**: `index.html` and `index_en.html` must stay in sync — same structure, translated content. Edit both when changing layout or sections.
- **Project card overrides**: To change a project's display image or description without touching GitHub, edit `PROJECT_IMAGES` or `PROJECT_DESCRIPTIONS` in `script.js` (keyed by repo name).
- **Adding a new project image**: place it in `img/`, add the mapping in `PROJECT_IMAGES`.
- **Skills card background**: `img/—Pngtree—abstract white green and gold_16458333.jpg` is used as the fluid marble texture for `.skills-card` backgrounds. Regular cards use `::before`, `.future-focus-card` uses `::after` (its `::before` is reserved for the gradient glow effect). Card base is a pink→white→mint gradient using `#FFB6C1` / `#C0FFB6`. Do not animate `.skills-blob` or add full-section overlays — causes severe performance regression.
- **Favicon assets** live in `favicon/` (not `favicon_io/`).
- `pinned-repos.json` is gitignored — it's generated at runtime on the server.
- **Profile image URLs** in `signature.html` must be absolute (`https://junho.art/img/...`) so email recipients can load them. Never use relative paths.

## CSS conventions

New colors and radii must use or extend the CSS variables in `:root` (`style.css`) — do not add raw hex values:

| Variable | Value | Use |
| --- | --- | --- |
| `--bg-color` | `#fff9fb` | Page background |
| `--text-color` | `#594a4e` | Body text |
| `--heading-color` | `#b37f8c` | Headings, logo, accents |
| `--accent-green` | `#86b37f` | Active state (lang toggle, hover), badges |
| `--accent-green-light` | `#c0ffb6` | Background blob, toast icon |
| `--accent-purple` | `#8c7fb3` | Future-focus card border, timeline gradient, now-badge |
| `--text-muted` | `#a59397` | Footer, subdued labels |
| `--border-color` | `#f2e8ea` | Card borders, dividers |
| `--card-radius` | `18px` | Glass cards |
| `--pill-radius` | `50px` | Badge / now-badge shapes |

> **Note**: `--accent-purple` was previously defined as `var(--accent-purple)` (self-referential, resolved to invalid). It is now correctly set to `#8c7fb3`.

Language toggle markup uses dedicated CSS classes — do not add inline styles:

- `.lang-toggle-container` — the pill wrapper in the desktop header
- `.mobile-lang-toggle` — the drawer equivalent
- `.lang-active` — active language label (color: `--accent-green`)
- `.lang-sep` / `.lang-inactive` — separator and switchable link

The `.lang-active` / `.lang-inactive` classes also apply inside `.mobile-lang-toggle`. The active language is always a `<span>`, the inactive one is an `<a>`. The `.nav-drawer a` and `.desktop-nav a` rules override font-size/margin on anchor tags, so any anchor inside these toggles needs the CSS overrides already present in `style.css` (`.nav-drawer .mobile-lang-toggle a` and `.desktop-nav .lang-toggle-container a`).

Footer uses `.contact-line` and `.sep` classes (defined in `style.css`) — no inline styles needed.

## Accessibility

Every decorative FontAwesome `<i>` must have `aria-hidden="true"`. All `target="_blank"` links must include `rel="noopener noreferrer"`.
