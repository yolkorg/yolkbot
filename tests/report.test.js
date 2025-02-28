import Bot from '#bot';

import ReportPlayerDispatch from '#dispatch/ReportPlayerDispatch.js';
import SpawnDispatch from '#dispatch/SpawnDispatch.js';

const bot = new Bot({ name: 'selfbot' });

bot.on('playerJoin', (player) => {
    console.log(player.name, 'joined.');
});

bot.on('chat', (_player, msg) => {
    if (msg == 'spawn') bot.dispatch(new SpawnDispatch());
    if (msg == 'report') bot.dispatch(new ReportPlayerDispatch(_player.id, { cheating: true }));
})

await bot.join(process.env.GAME_CODE || process.argv[2]);