import fs from 'node:fs';
import path from 'node:path';

import { UserAgent } from '../common.js';

const data = await fetch('https://shellshock.io/language/en.json', {
    headers: {
        'User-Agent': UserAgent
    }
});

const lang = await data.json();

fs.writeFileSync(
    path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'language.js'),
    `/* eslint-disable */\nexport const Language = ${JSON.stringify(lang, null, 4)};`
);

console.log('scraped language');