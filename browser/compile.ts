import fs from 'node:fs';
import path from 'node:path';

const buildDir = path.join(import.meta.dirname, 'build');

if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
fs.mkdirSync(buildDir);

const replaceBrowserFiles: Bun.BunPlugin = {
    name: 'replaceBrowserFiles',

    setup(build) {
        const findItemById = path.join(import.meta.dirname, '../src/constants/findItemById.js').replace(/\\/g, '/');

        build.onLoad({
            filter: new RegExp(`${findItemById.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
        }, () => ({
            contents: 'export const findItemById = () => null',
            loader: 'js'
        }));

        const iFetch = path.join(import.meta.dirname, '../src/env/fetch.js').replace(/\\/g, '/');

        build.onLoad({
            filter: new RegExp(`${iFetch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
        }, () => ({
            contents: 'const iFetch = globalThis.fetch;\nexport default iFetch;',
            loader: 'js'
        }));
    }
};

fs.rmSync(buildDir, { recursive: true });
fs.mkdirSync(buildDir);

const build = async (module: 'global' | 'module') => {
    await Bun.build({
        entrypoints: [path.join(import.meta.dirname, 'entry', `${module}.js`)],
        outdir: buildDir,

        minify: !process.argv.includes('-nm'),
        target: 'browser',
        format: 'esm',
        plugins: [replaceBrowserFiles]
    });

    console.log(`\x1b[32m✓ built browser/${module}\x1b[0m`);
}

build('global');
build('module');