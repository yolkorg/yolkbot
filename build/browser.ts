import fs from 'node:fs';
import path from 'node:path';

import { getFileObject } from './common.ts';

const buildDir = path.join(import.meta.dirname, '..', 'browser', 'build');

if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
fs.mkdirSync(buildDir);

const iFetchPath = path.join(import.meta.dirname, '../src/env/fetch.js');
const itemPath = path.join(import.meta.dirname, '../src/constants/items.js');

const files = await getFileObject();

interface Module {
    name: string;
    entry: string;
}

const rootDir = path.join(import.meta.dirname, '..');

const build = async (module: Module) => {
    const results = await Bun.build({
        entrypoints: [module.entry],

        minify: {
            identifiers: false,
            syntax: true,
            whitespace: true
        },
        target: 'browser',
        format: 'esm',
        // @ts-expect-error bun 1.3.6 types have not been updated yet
        files: {
            ...files,
            [iFetchPath]: 'export const iFetch = globalThis.fetch;\nexport default iFetch;',
            [itemPath]: 'export const Items = [];'
        }
    });

    for (const file of results.outputs)
        Bun.write(path.join(buildDir, `${module.name}.js`), new Response(file));

    console.log(`\x1b[32m✓ built browser/${module.name}\x1b[0m`);
}

build({ name: 'global', entry: path.join(rootDir, 'browser', 'globalEntry.js') });
build({ name: 'module', entry: path.join(rootDir, 'src', 'index.js') });