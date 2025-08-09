import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(import.meta.dirname, '..', 'src');
const distDir = path.join(import.meta.dirname, '..', 'dist');

const manifest = await fetch('https://data.yolkbot.xyz/manifest.json').then(res => res.json());

const buildAndWrite = async (dest, code, forceMinify) => {
    const esmResult = await esbuild.transform(code, {
        minify: forceMinify || process.argv[2] !== '--no-minify',
        keepNames: true,
        loader: 'js',
        format: 'esm',
        target: 'esnext',
        banner: '/* eslint-disable */\n'
    });

    return fs.writeFileSync(dest, esmResult.code);
}

const handleConstants = async (src, dest, code) => {
    const fileName = path.parse(src).name;

    if (fileName === 'findItemById') return fs.cpSync(src, dest);

    const importedValues = ['challenges', 'CommCode', 'items', 'maps', 'regions'];
    if (importedValues.includes(fileName)) {
        const manifestEntry = manifest[fileName];
        const serverPath = manifestEntry.path;

        const serverResult = await fetch(`https://data.yolkbot.xyz${serverPath}`).then(res => res.text());
        const rewrittenCode = code.replace(/{}|\[\]/, serverResult);
        return buildAndWrite(dest, rewrittenCode, true);
    } else return buildAndWrite(dest, code);
}

const copyAndMinify = async (src, dest) => {
    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });

        for (const entry of fs.readdirSync(src))
            copyAndMinify(path.join(src, entry), path.join(dest, entry));

        return;
    }

    if (src.endsWith('.js')) {
        const code = fs.readFileSync(src, 'utf8');

        if (src.includes('/constants/')) await handleConstants(src, dest, code);
        else await buildAndWrite(dest, code);

        return;
    }

    if (src.endsWith('.d.ts')) return fs.copyFileSync(src, dest);

    const fileType = src.split('.').pop();
    if (!['DS_Store', 'wasm'].includes(fileType)) console.log('unknown file type:', fileType);
}

if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir);

copyAndMinify(srcDir, distDir);

console.log('completed node build!');