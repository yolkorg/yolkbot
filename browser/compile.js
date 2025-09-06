import * as esbuild from 'esbuild';

import fs from 'node:fs';
import path from 'node:path';

const buildDir = path.join(import.meta.dirname, 'build');

if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
fs.mkdirSync(buildDir);

const replaceBrowserFiles = {
    name: 'replaceBrowserFiles',

    setup(build) {
        const findItemById = path.join(import.meta.dirname, '../src/constants/findItemById.js').replace(/\\/g, '/');

        build.onLoad({
            filter: new RegExp(findItemById.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$')
        }, () => ({
            contents: 'export const findItemById = () => null',
            loader: 'js'
        }));

        const iFetch = path.join(import.meta.dirname, '../src/env/fetch.js').replace(/\\/g, '/');

        build.onLoad({
            filter: new RegExp(iFetch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$')
        }, () => ({
            contents: 'const iFetch = globalThis.fetch;\nexport default iFetch;',
            loader: 'js'
        }));
    }
};

const build = async (module) => {
    await esbuild.build({
        entryPoints: [path.join(import.meta.dirname, 'entry', `${module}.js`)],
        outfile: path.join(buildDir, `${module}.js`),

        minify: true,
        bundle: true,
        target: 'esnext',
        format: 'esm',
        plugins: [replaceBrowserFiles],
        external: ['node:*']
    });

    const output = fs.readFileSync(path.join(buildDir, `${module}.js`), 'utf-8');
    const modifiedOutput = output.replace(/await import\("[a-zA-Z:]+"\)/g, '{}');

    fs.writeFileSync(path.join(buildDir, `${module}.js`), modifiedOutput);

    console.log(`completed ${module} build!`);
}

build('global');
build('module');