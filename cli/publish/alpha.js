/* eslint-disable camelcase */

const webhook = process.env.NPM_DEV_WEBHOOK;

import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));

const codeblock = '```';

await fetch(webhook, {
    method: 'POST',
    body: JSON.stringify({
        embeds: [{
            author: {
                name: `${pkg.name} ${pkg.version.replace(/-([a-zA-Z]+)\./, ' / $1 ')}`,
                url: `https://www.npmjs.com/package/yolkbot/v/${pkg.version}`,
                icon_url: 'https://cdn.discordapp.com/icons/1342571038063460443/620ed351a0e43104c4ec8cc4a8304870.png?size=128'
            },
            color: 39902,
            description: `${codeblock}npm install ${pkg.name}@${pkg.version}${codeblock}${codeblock}bun add ${pkg.name}@${pkg.version}${codeblock}${codeblock}pnpm add ${pkg.name}@${pkg.version}${codeblock}\n**report cockroaches (& other bugs) in** <#1342571945123774527>`
        }]
    }),
    headers: {
        'Content-Type': 'application/json'
    }
})

console.log('\nsent to discord webhook!');