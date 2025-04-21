import fs from 'node:fs';
import path from 'node:path';

import { getJS, UserAgent } from '../common.js';

const js = await getJS();

const match = js.match(/\[\{id:1,.*?\}\]/)?.[0];

// eslint-disable-next-line prefer-const
let parsed = '';

eval(`parsed = ${match}`);

const langData = await fetch('https://shellshock.io/language/en.json', {
    headers: {
        'User-Agent': UserAgent
    }
});

const lang = await langData.json();

for (const item of parsed) item.loc = {
    title: lang[item.loc_ref + '_title'],
    desc: lang[item.loc_ref + '_desc']
}

fs.writeFileSync(
    path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'challenges.js'),
    `/* eslint-disable */\nexport const Challenges = ${JSON.stringify(parsed, null, 4)};`
);

console.log('scraped challenges');