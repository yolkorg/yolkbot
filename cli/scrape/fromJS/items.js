import fs from 'node:fs';
import path from 'node:path';

import { getJS } from '../common.js';

const js = await getJS();

const match = js.match(/\[\{id:1001,.*?\}\]/)?.[0];

// eslint-disable-next-line prefer-const
let parsed = '';

eval(`parsed = ${match}`);

fs.writeFileSync(
    path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'items.js'),
    `/* eslint-disable */\nexport const Items = ${JSON.stringify(parsed, null, 4)};`
);

console.log('scraped items');