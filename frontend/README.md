# Plank Frontend

Modern frontend for Plank WebSocket client built with Bun.

## Features

- 🚀 **Bun.serve** - Fast dev server with built-in HMR
- 🎨 **Modern CSS** - CSS nesting and variables
- 📦 **TypeScript** - Type-safe development with strict mode
- ⚛️ **Preact** - Lightweight React alternative (3kB)
- 🔄 **deepsignal** - Simple reactive state management (following Expressio pattern)
- 🔥 **Hot Module Reloading** - Instant updates without full page refresh
- 🔌 **API Proxy** - Dev server proxies requests to FastAPI backend
- 🧹 **oxlint** - Fast Rust-based linter for TypeScript

## Structure

```
frontend/
├── src/
│   ├── index.html          # Main HTML file
│   ├── main.tsx            # Application entry point
│   ├── components/         # Preact components
│   │   ├── App.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── CreateItemForm.tsx
│   │   ├── LogPanel.tsx
│   │   └── StatusIndicator.tsx
│   ├── lib/                # Utilities
│   │   ├── config.ts       # Environment configuration
│   │   └── websocket.ts    # WebSocket client
│   ├── store/              # State management
│   │   ├── index.ts        # deepsignal store ($s)
│   │   └── types.ts        # TypeScript types
│   └── styles/
│       ├── variables.css   # CSS variables
│       └── main.css        # Main styles with nesting
├── dist/                   # Build output (generated)
├── .oxlintrc.json          # Linter configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Package configuration
├── build.ts                # Production build script
└── dev.ts                  # Development server with HMR
```

## Prerequisites

- [Bun](https://bun.sh) v1.0 or higher

## Installation

```bash
# Install dependencies
bun install
```

## Development

The frontend uses **Bun.serve()** with HTML imports, which provides built-in Hot Module Reloading (HMR). The dev server proxies API requests to the FastAPI backend.

### Workflow

**Terminal 1** - FastAPI backend server:
```bash
# From project root
uv run uvicorn plank.main:app --reload
```

**Terminal 2** - Bun frontend dev server with HMR:
```bash
cd frontend
bun run dev
```

This starts:
- 🌐 Bun dev server on `http://localhost:3000`
- 🔥 Hot Module Reloading (instant updates without full page refresh)
- 🔌 API proxy: `/api/*` requests → `http://localhost:8000`
- 📡 WebSocket connects directly to backend on port 8000

Then open **http://localhost:3000** in your browser. When you edit files in `frontend/src/`, changes appear instantly with HMR!

### Other commands

```bash
# Build for production (one-time build)
bun run build

# Clean build artifacts
bun run clean

# Run linter
bun run lint

# Auto-fix linting issues
bun run lint:fix

# Type check
bun run type-check
```

## Production Build

For production, build static files that FastAPI can serve:

```bash
bun run build
```

This generates:
- `dist/bundle.js` - Bundled and minified JavaScript
- `dist/bundle.css` - Bundled and minified CSS
- `dist/index.html` - HTML file with proper static asset paths

The FastAPI backend serves these files from the `dist/` directory.

## Modern CSS Features

This project uses modern CSS features:

### CSS Variables
All colors, spacing, and typography are defined as CSS variables in `variables.css`:

```css
:root {
  --color-primary: #007bff;
  --spacing-lg: 20px;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
}
```

### CSS Nesting
Nested selectors for better organization:

```css
.panel {
  background: var(--color-surface);

  & h2 {
    margin-top: 0;
  }

  & h3 {
    margin-top: var(--spacing-xl);
  }
}
```

## How HMR Works

Bun's built-in Hot Module Reloading provides instant updates:

1. **HTML Imports** - `import index from "./src/index.html"` tells Bun to bundle and watch the HTML and its dependencies
2. **Automatic Bundling** - Bun processes `<script>` and `<link>` tags, bundling JS/CSS on the fly
3. **File Watching** - Bun watches source files for changes
4. **Hot Updates** - Changes are pushed to the browser instantly without full page reload (when possible)
5. **WebSocket HMR Channel** - Bun uses its own WebSocket for HMR communication

This is [Bun's fullstack dev server](https://bun.com/docs/bundler/fullstack) feature in action!

## State Management

The application uses **deepsignal** for reactive state management, following the pattern from the [Expressio project](https://github.com/garage44/expressio).

### The `$s` Convention

State is exported as `$s` to indicate it's a signal/reactive state:

```typescript
// store/index.ts
export const $s = deepSignal<AppState>({
  connected: false,
  logs: [],
  itemName: '',
  itemValue: '',
});
```

### Direct Mutations

Components mutate state directly without actions - deepsignal handles reactivity:

```typescript
// In any component
import { $s } from '../store';

// Read reactive state
<div>{$s.connected ? 'Connected' : 'Disconnected'}</div>

// Mutate state directly
onClick={() => $s.logs = []}
onInput={(e) => $s.itemName = e.target.value}
```

This pattern is simpler and easier to follow than centralized actions, as you can trace state changes directly in components.

## Development vs Production

### Development Mode (`bun run dev`)
- Runs Bun.serve on port 3000
- Built-in HMR for instant updates
- Proxies `/api` requests to FastAPI (port 8000)
- WebSocket connects directly to backend
- No minification (faster builds)

### Production Mode (`bun run build`)
- Generates static files in `dist/`
- FastAPI serves files directly from `dist/`
- Minified and optimized assets
- No dev server needed

## Integration with Backend

**Development:** Bun serves frontend with HMR, proxies API calls to FastAPI.
**Production:** FastAPI serves the built static files from `dist/`.

See the main project README for full setup instructions.
