import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(import.meta.dirname, '..', 'src');
const distDir = path.join(import.meta.dirname, '..', 'dist');

function copyAndMinify(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src))
            copyAndMinify(path.join(src, entry), path.join(dest, entry));
    } else if (src.endsWith('.js')) {
        const code = fs.readFileSync(src, 'utf8');

        esbuild.transform(code, {
            minify: process.argv[2] !== '--no-minify',
            loader: 'js',
            format: 'esm',
            target: 'esnext',
            banner: '/* eslint-disable */\n'
        }).then(result => fs.writeFileSync(dest, result.code));
    } else fs.copyFileSync(src, dest);
}

if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir);

copyAndMinify(srcDir, distDir);

console.log('completed node build!');