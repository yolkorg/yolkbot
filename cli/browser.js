import * as esbuild from 'esbuild';

import fs from 'node:fs';
import path from 'node:path';

const buildDir = path.join(import.meta.dirname, '..', 'build');

if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
fs.mkdirSync(buildDir);

await esbuild.build({
    entryPoints: [path.join(import.meta.dirname, '..', 'src', 'browser.js')],
    outfile: path.join(buildDir, 'browser.js'),

    minify: true,
    bundle: true,
    target: 'esnext',
    format: 'esm',
    banner: {
        js: '/* eslint-disable */\n'
    },
    external: ['smallsocks', 'node:fs', 'node:os', 'node:path']
});

let build = fs.readFileSync(path.join(buildDir, 'browser.js'), 'utf-8');

build = build.replace(/import\("[a-zA-Z]+"\)/g, 'void 0');

fs.writeFileSync(path.join(buildDir, 'browser.js'), build);

console.log('completed browser build!');