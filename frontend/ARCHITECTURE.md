# Frontend Architecture

## Overview

The Plank frontend uses Bun's fullstack development server with HTML imports for an optimal development experience, and generates static files for production deployment.

## Development Mode

```bash
cd frontend
bun run dev
```

### How it Works

1. **Bun.serve()** runs on port `3000`
2. **HTML Import**: `import index from "./src/index.html"` enables Bun's bundler
3. **Automatic Processing**:
   - Bun scans HTML for `<script>` and `<link>` tags
   - Bundles JavaScript/TypeScript (transpiles JSX/TSX)
   - Bundles CSS (processes imports)
   - Enables Hot Module Reloading (HMR)
4. **API Proxy**: Routes starting with `/api` are proxied to FastAPI on port `8000`
5. **WebSocket**: Connects directly to backend on port `8000`

### Environment Detection

The `config.js` module detects the environment by checking `window.location.port`:

```javascript
// Port 3000 = development (Bun dev server)
const isDev = window.location.port === '3000';

// Use appropriate backend URLs
wsUrl: isDev ? 'ws://localhost:8000/ws' : '...'
apiUrl: isDev ? 'http://localhost:8000' : '...'
```

### Benefits

- ✨ **Instant Updates** - HMR updates code without full page refresh
- 🚀 **Fast Builds** - No minification in dev mode
- 🔍 **Source Maps** - Easy debugging with original source
- 🎯 **Single Command** - No separate bundler process needed

## Production Mode

```bash
bun run build
```

### How it Works

1. **Bundle JavaScript**: Transpiles, bundles, and minifies `src/scripts/main.js`
2. **Bundle CSS**: Processes and minifies `src/styles/main.css`
3. **Update HTML**: Rewrites paths from `./scripts/main.js` to `/static/bundle.js`
4. **Output to dist/**: Static files ready for FastAPI to serve

### Deployment

FastAPI serves the `dist/` directory:

```python
# plank/main.py
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
async def index():
    return FileResponse(FRONTEND_DIR / "index.html")
```

### Benefits

- 📦 **Single Bundle** - Optimized for production
- ⚡ **Minified** - Smaller file sizes
- 🎯 **Simple Deployment** - Just static files
- 🔒 **Secure** - No dev server in production

## File Structure

```
frontend/
├── src/                    # Source files
│   ├── index.html         # Entry point
│   ├── styles/
│   │   ├── variables.css  # CSS custom properties
│   │   └── main.css       # Main styles (uses nesting)
│   └── scripts/
│       ├── config.js      # Environment configuration
│       └── main.js        # WebSocket client
├── dist/                   # Built files (generated)
│   ├── index.html         # Processed HTML
│   ├── bundle.js          # Bundled JavaScript
│   ├── bundle.js.map      # Source map
│   └── bundle.css         # Bundled CSS
├── dev.ts                  # Dev server with Bun.serve
├── build.ts                # Production build script
└── package.json            # Configuration
```

## Key Technologies

- **[Bun](https://bun.sh)** - Fast JavaScript runtime and bundler
- **[Bun.serve](https://bun.com/docs/bundler/fullstack)** - Built-in dev server with HMR
- **Modern CSS** - Native nesting and custom properties
- **ES Modules** - Native JavaScript modules

## Workflow Comparison

| Feature | Development | Production |
|---------|------------|-----------|
| **Server** | Bun (port 3000) | FastAPI (port 8000) |
| **HMR** | ✅ Yes | ❌ No |
| **Bundling** | On-demand | Pre-built |
| **Minification** | ❌ No | ✅ Yes |
| **Source Maps** | ✅ External | ✅ External |
| **API Calls** | Proxied | Direct |
| **WebSocket** | Direct to backend | Direct to backend |

## References

- [Bun Fullstack Dev Server](https://bun.com/docs/bundler/fullstack)
- [Bun.build API](https://bun.com/docs/bundler)
- [FastAPI Static Files](https://fastapi.tiangolo.com/tutorial/static-files/)
