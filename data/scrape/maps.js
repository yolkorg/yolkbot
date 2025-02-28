import fs from 'fs';
import path from 'path';

import { UserAgent } from '../../src/constants/index.js';

const data = await fetch('https://shellshock.io/js/shellshock.js', {
    headers: {
        'User-Agent': UserAgent
    }
});

const js = await data.text();

const match = js.match(/\[\{filename.*?\}\]/)?.[0];

// eslint-disable-next-line prefer-const
let parsed = '';

eval(`parsed = ${match}`);

fs.writeFileSync(
    path.join(import.meta.dirname, '..', 'maps.js'),
    `/* eslint-disable */\nexport const Maps = ${JSON.stringify(parsed, null, 4)};`
);