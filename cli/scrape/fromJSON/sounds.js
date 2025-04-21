import fs from 'node:fs';
import path from 'node:path';

import { UserAgent } from '../common.js';

const data = await fetch('https://shellshock.io/sound/sounds.json', {
    headers: {
        'User-Agent': UserAgent
    }
});

const lang = await data.json();

fs.writeFileSync(
    path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'sounds.js'),
    `/* eslint-disable */\nexport const Sounds = ${JSON.stringify(lang, null, 4)};`
);

console.log('scraped sounds');