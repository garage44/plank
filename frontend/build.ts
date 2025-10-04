// Production build script for bundling the frontend
import {mkdirSync, readFileSync, writeFileSync} from 'fs'
import {join} from 'path'

const distDir = './dist'

console.log('🔨 Building for production...\n')

// Ensure dist directory exists
mkdirSync(distDir, {recursive: true})

// Bundle TypeScript/TSX and CSS together
// Bun will automatically extract CSS imports from .tsx files
const result = await Bun.build({
    entrypoints: ['./src/main.tsx'],
    minify: true,
    naming: {
        entry: '[dir]/bundle.[ext]',
    },
    outdir: distDir,
    sourcemap: 'external',
    target: 'browser',
})

if (!result.success) {
    console.error('❌ Build failed')
    for (const log of result.logs) {
        console.error(log)
    }
    process.exit(1)
}

// Check if CSS was generated
const outputs = result.outputs
const cssOutput = outputs.find((o) => o.path.endsWith('.css'))
if (!cssOutput) {
    console.warn('⚠️  No CSS output found - CSS imports from components may not be included')
}

// Copy and update HTML with correct static paths for FastAPI
let html = readFileSync('./src/index.html', 'utf-8')

// Update paths to use /static/ prefix for FastAPI serving
html = html.replace('./styles/main.css', '/static/bundle.css')
html = html.replace('./main.tsx', '/static/bundle.js')

writeFileSync(join(distDir, 'index.html'), html)

console.log('✅ Production build complete!')
console.log('\nGenerated files:')
console.log('  - dist/bundle.js')
console.log('  - dist/bundle.js.map')
console.log('  - dist/bundle.css')
console.log('  - dist/index.html')
