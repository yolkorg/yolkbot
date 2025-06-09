import fs from 'node:fs';
import path from 'node:path';

const data = await fetch('https://archive.getstate.farm/commcodes/latest.json');

const { codes } = await data.json();

fs.writeFileSync(
    path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'CommCode.js'),
    `/* eslint-disable */\nexport const CommCode = ${JSON.stringify(codes, null, 4)};\n\nexport default CommCode;`
);

console.log('scraped codes');