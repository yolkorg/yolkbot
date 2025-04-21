import fs from 'node:fs';
import path from 'node:path';

import { getJS } from '../common.js';

const js = await getJS();

const match = js.match(/\[\{itemIds:.*?\}\][,|;]/)?.[0];

// eslint-disable-next-line prefer-const
let parsed = '';

eval(`parsed = ${match.slice(0, -1)}`);

fs.writeFileSync(
    path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'shopItems.js'),
    `/* eslint-disable */\nexport const ShopItems = ${JSON.stringify(parsed, null, 4)};`
);

console.log('scraped shop items');