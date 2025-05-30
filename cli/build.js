import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(import.meta.dirname, '..', 'src');
const distDir = path.join(import.meta.dirname, '..', 'dist');

const copyAndMinify = async (src, dest) => {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src))
            copyAndMinify(path.join(src, entry), path.join(dest, entry));
        return;
    } else if (src.endsWith('.js')) {
        const code = fs.readFileSync(src, 'utf8');

        if (!src.includes('findItemById')) {
            const esmResult = await esbuild.transform(code, {
                minify: process.argv[2] !== '--no-minify',
                loader: 'js',
                format: 'esm',
                target: 'esnext',
                banner: '/* eslint-disable */\n'
            });

            return fs.writeFileSync(dest, esmResult.code);
        } else return fs.cpSync(src, dest);
    } else if (src.endsWith('.ts')) return fs.cpSync(src, dest);

    const fileType = src.split('.').pop();
    if (!['DS_Store', 'wasm'].includes(fileType)) console.log('unknown file type:', fileType);
}

if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir);

copyAndMinify(srcDir, distDir);

console.log('completed node build!');