/* eslint-disable stylistic/max-len */
/* eslint-disable camelcase */

const webhook = process.env.NPM_WEBHOOK;

import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));

await fetch(webhook, {
    method: 'POST',
    body: JSON.stringify({
        embeds: [{
            author: {
                name: 'npm package release',
                icon_url: 'https://i.imgur.com/yl2AH1a.png'
            },
            title: `${pkg.name} v${pkg.version} has been published!`,
            color: 16711680,
            description: `**\`${pkg.version}\`** - https://npmjs.com/package/${pkg.name}\n\n\`npm install yolkbot@${pkg.version}\`\n\`bun add yolkbot@${pkg.version}\`\n\`yarn add yolkbot@${pkg.version}\``
        }]
    }),
    headers: {
        'Content-Type': 'application/json'
    }
});

console.log('\nsent to discord webhook!');