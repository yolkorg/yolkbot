/* eslint-disable stylistic/max-len */
/* eslint-disable camelcase */

const webhook = process.env.NPM_DEV_WEBHOOK;

import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));

await fetch(webhook, {
    method: 'POST',
    body: JSON.stringify({
        embeds: [{
            author: {
                name: 'alpha package release',
                icon_url: 'https://i.imgur.com/yl2AH1a.png'
            },
            title: `${pkg.name}@${pkg.version} has been published!`,
            color: 16711680,
            description: `\`npm install ${pkg.name}@${pkg.version}\`\n\`bun add ${pkg.name}@${pkg.version}\`\n\`yarn add ${pkg.name}@${pkg.version}\`\n\n> this is an alpha release.\n> not everything will work perfectly.\n> this is usually done for public testing.\n> we <3 feedback! <#1342571945123774527>`
        }]
    }),
    headers: {
        'Content-Type': 'application/json'
    }
})

console.log('\nsent to discord webhook!');