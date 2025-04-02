import fs from 'node:fs';
import path from 'node:path';

const data = await fetch('https://js.getstate.farm/commcodes/latest.json');

const js = await data.json();

fs.writeFileSync(
    path.join(import.meta.dirname, '..', '..', 'src', 'constants', 'codes.js'),
    `/* eslint-disable */\nexport const CommCodes = ${JSON.stringify(js.codes, null, 4)};`
);

console.log('scraped codes');