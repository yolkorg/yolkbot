import fs from 'node:fs';
import path from 'node:path';

import { getFileObject } from './common.ts';

const buildDir = path.join(import.meta.dirname, '..', 'browser', 'build');

if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
fs.mkdirSync(buildDir);

const iFetchPath = path.join(import.meta.dirname, '../src/env/fetch.js');
const findItemPath = path.join(import.meta.dirname, '../src/constants/findItemById.js');

const files = await getFileObject();

const build = async (module: string) => {
    await Bun.build({
        entrypoints: [path.join(import.meta.dirname, '..', 'browser', 'entry', `${module}.js`)],
        outdir: buildDir,

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
            [findItemPath]: 'export const findItemById = () => null;'
        }
    });

    console.log(`\x1b[32m✓ built browser/${module}\x1b[0m`);
}

build('global');
build('module');