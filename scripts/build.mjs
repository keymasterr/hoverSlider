// Wraps the classic-script source into an ES module for bundlers and `import`.
// hoverSlider.js stays the single source of truth: it's what <script> tags,
// the CDN and the demo page load, so it can't carry `export` statements itself.
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const src = await readFile(new URL('hoverSlider.js', root), 'utf8');

await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(
  new URL('dist/hoverSlider.mjs', root),
  `// Generated from hoverSlider.js by scripts/build.mjs — do not edit.\n\n${src.trimEnd()}\n\nexport default hoverSlider;\nexport { hoverSlider };\n`
);
