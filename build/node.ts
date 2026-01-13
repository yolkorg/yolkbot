import fs from 'node:fs';
import path from 'node:path';

import { getFileObject } from './common';

const srcDir = path.join(import.meta.dirname, '..', 'src');
const distDir = path.join(import.meta.dirname, '..', 'dist');

if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });

const globPattern = new Bun.Glob('**/*.js');
const entrypoints = await Array.fromAsync(globPattern.scan(srcDir));

const fileReplacements = await getFileObject();

const transpiler = new Bun.Transpiler({ loader: 'js' });

for (const entry of entrypoints) {
    const srcPath = path.join(srcDir, entry);
    const distPath = path.join(distDir, entry);

    if (!fs.existsSync(path.dirname(distPath)))
        fs.mkdirSync(path.dirname(distPath), { recursive: true });
    
    const code = fileReplacements[srcPath] || fs.readFileSync(srcPath, 'utf8');
    const result = transpiler.transformSync(code);
    
    fs.writeFileSync(distPath, result);
}

const dtsGlobPattern = new Bun.Glob('**/*.d.ts');
const dtsFiles = await Array.fromAsync(dtsGlobPattern.scan(path.join(srcDir, 'types')));

for (const file of dtsFiles) {
    const src = path.join(srcDir, 'types', file);
    const dest = path.join(distDir, file.replace('types/', ''));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}

console.log('\x1b[32m✓ built node\x1b[0m');