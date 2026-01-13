import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(import.meta.dirname, '..', 'src');
const constantsDir = path.join(srcDir, 'constants');

export const getFileObject = async (): Promise<Record<string, string>> => {
    const fileObject: Record<string, string> = {};

    const manifest = await fetch('https://x.yolkbot.xyz/data/manifest.json').then(res => res.json());

    const externalConstants = ['challenges', 'CommCode', 'items', 'maps', 'regions'];
    await Promise.all(externalConstants.map(async (fileName) => {
        const manifestEntry = manifest[fileName];
        const serverPath = manifestEntry.path;

        const serverResult = await fetch(`https://x.yolkbot.xyz/data${serverPath}`).then(res => res.text());
        const localPath = path.join(constantsDir, `${fileName}.js`);
        const code = fs.readFileSync(localPath, 'utf8');
        const rewrittenCode = code.replace(/{}|\[\]/, serverResult);
        fileObject[localPath] = rewrittenCode;
    }));

    return fileObject;
}