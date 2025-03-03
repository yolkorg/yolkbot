import * as esbuild from 'esbuild';

import fs from 'node:fs';
import path from 'node:path';

const buildDir = path.join(import.meta.dirname, '..', 'build');

if (fs.existsSync(buildDir)) fs.rmdirSync(buildDir, { recursive: true });
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
    external: ['socks-proxy-agent', 'node:fs', 'node:path']
});

console.log('completed browser build!');