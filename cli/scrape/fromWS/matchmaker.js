import fs from 'node:fs';
import path from 'node:path';

const ws = new WebSocket('wss://shellshock.io/matchmaker/', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
});

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.command === 'notice') {
        fs.writeFileSync(
            path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'notices.js'),
            `/* eslint-disable */\nexport const Notices = ${JSON.stringify(data.notices, null, 4)};`
        );

        console.log('scraped notices');

        ws.send(JSON.stringify({ command: 'regionList' }));
    }

    if (data.command === 'regionList') {
        fs.writeFileSync(
            path.join(import.meta.dirname, '..', '..', '..', 'src', 'constants', 'regions.js'),
            `/* eslint-disable */\nexport const Regions = ${JSON.stringify(data.regionList, null, 4)};`
        );

        console.log('scraped regions');

        ws.close();
    }
}