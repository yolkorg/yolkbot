import fs from 'node:fs';
import path from 'node:path';

import { UserAgent } from '../common.js';

const data = await fetch('https://shellshock.io/data/housePromo.json?' + Date.now(), {
    headers: {
        'User-Agent': UserAgent
    }
});

const housePromo = await data.json();

fs.writeFileSync(
    path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'housePromo.js'),
    `/* eslint-disable */\nexport const HousePromo = ${JSON.stringify(housePromo, null, 4)};`
);

console.log('scraped house promo');