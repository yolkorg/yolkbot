import fs from 'node:fs';
import path from 'node:path';

import { UserAgent } from '../common.js';

const data = await fetch('https://shellshock.io/data/shellNews.json', {
    headers: {
        'User-Agent': UserAgent
    }
});

const lang = await data.json();

fs.writeFileSync(
    path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'shellNews.js'),
    `/* eslint-disable */\nexport const ShellNews = ${JSON.stringify(lang, null, 4)};`
);

console.log('scraped shell news');