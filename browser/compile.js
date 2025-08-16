import * as esbuild from 'esbuild';

import fs from 'node:fs';
import path from 'node:path';

const buildDir = path.join(import.meta.dirname, 'build');

if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
fs.mkdirSync(buildDir);

const replaceItemImport = {
    name: 'replaceItemImport',

    setup(build) {
        const specialFilePath = path.join(import.meta.dirname, '../src/constants/findItemById.js').replace(/\\/g, '/');

        build.onLoad({
            filter: new RegExp(specialFilePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$')
        }, () => ({
            contents: 'export const findItemById = () => null',
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
        plugins: [replaceItemImport],
        external: ['smallsocks', 'ws', 'node:*']
    });

    const output = fs.readFileSync(path.join(buildDir, `${module}.js`), 'utf-8');
    const modifiedOutput = output.replace(/await import\("[a-zA-Z:]+"\)/g, '{}');

    fs.writeFileSync(path.join(buildDir, `${module}.js`), modifiedOutput);

    console.log(`completed ${module} build!`);
}

build('global');
build('module');