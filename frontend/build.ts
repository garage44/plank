// Production build script for bundling the frontend
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const distDir = './dist';

console.log('🔨 Building for production...\n');

// Ensure dist directory exists
mkdirSync(distDir, { recursive: true });

// Bundle TypeScript/TSX
const jsResult = await Bun.build({
  entrypoints: ['./src/main.tsx'],
  outdir: distDir,
  minify: true,
  sourcemap: 'external',
  target: 'browser',
  naming: {
    entry: '[dir]/bundle.[ext]'
  }
});

if (!jsResult.success) {
  console.error('❌ TypeScript build failed');
  for (const log of jsResult.logs) {
    console.error(log);
  }
  process.exit(1);
}

// Bundle CSS
const cssResult = await Bun.build({
  entrypoints: ['./src/styles/main.css'],
  outdir: distDir,
  minify: true,
  sourcemap: 'external',
  naming: {
    entry: '[dir]/bundle.[ext]'
  }
});

if (!cssResult.success) {
  console.error('❌ CSS build failed');
  for (const log of cssResult.logs) {
    console.error(log);
  }
  process.exit(1);
}

// Copy and update HTML with correct static paths for FastAPI
let html = readFileSync('./src/index.html', 'utf-8');

// Update paths to use /static/ prefix for FastAPI serving
html = html.replace('./styles/main.css', '/static/bundle.css');
html = html.replace('./main.tsx', '/static/bundle.js');

writeFileSync(join(distDir, 'index.html'), html);

console.log('✅ Production build complete!');
console.log('\nGenerated files:');
console.log('  - dist/bundle.js');
console.log('  - dist/bundle.js.map');
console.log('  - dist/bundle.css');
console.log('  - dist/index.html');
