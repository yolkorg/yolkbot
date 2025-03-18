import fs from 'node:fs';
import path from 'node:path';

const UserAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'

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
    path.join(import.meta.dirname, '..', '..', 'src', 'constants', 'maps.js'),
    `/* eslint-disable */\nexport const Maps = ${JSON.stringify(parsed, null, 4)};`
);
