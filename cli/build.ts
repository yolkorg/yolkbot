import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(import.meta.dirname, '..', 'src');
const distDir = path.join(import.meta.dirname, '..', 'dist');

const manifest = await fetch('https://x.yolkbot.xyz/data/manifest.json').then(res => res.json());

const minifiedTranspiler = new Bun.Transpiler({ minifyWhitespace: true, target: 'browser', loader: 'ts', inline: true });
const cleanTranspiler = new Bun.Transpiler({ minifyWhitespace: false, target: 'browser', loader: 'ts', inline: true });

const buildAndWrite = async (dest: string, code: string, forceMinify?: boolean) => {
    const transpiler = forceMinify || !process.argv.includes('-nm') ? minifiedTranspiler : cleanTranspiler;
    const transpileResult = await transpiler.transform(code);

    return fs.writeFileSync(dest, transpileResult);
}

const handleConstants = async (src: string, dest: string, code: string) => {
    const fileName = path.parse(src).name;

    if (fileName === 'findItemById') return fs.cpSync(src, dest);

    const importedValues = ['challenges', 'CommCode', 'items', 'maps', 'regions'];
    if (importedValues.includes(fileName)) {
        const manifestEntry = manifest[fileName];
        const serverPath = manifestEntry.path;

        const serverResult = await fetch(`https://x.yolkbot.xyz/data${serverPath}`).then(res => res.text());
        const rewrittenCode = code.replace(/{}|\[\]/, serverResult);
        buildAndWrite(dest, rewrittenCode, true);
    } else buildAndWrite(dest, code);
}

const copyAndMinify = async (src: string, dest: string) => {
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

    if (
        typeof fileType !== 'string' ||
        !['DS_Store', 'wasm'].includes(fileType)
    ) console.log('unknown file type:', fileType);
}

if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir);

copyAndMinify(srcDir, distDir);

console.log('\x1b[32m✓ built node\x1b[0m');