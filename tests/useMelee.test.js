/* eslint-disable curly */

import Bot from '#bot';

import MeleeDispatch from '#dispatch/MeleeDispatch.js';
import SpawnDispatch from '#dispatch/SpawnDispatch.js';

const bot = new Bot({ name: 'selfbot' });

bot.on('join', (player) => {
    console.log(player.name, 'joined.');
});

bot.on('chat', (_player, msg) => {
    if (msg == 'spawn') bot.dispatch(new SpawnDispatch());
    if (msg == 'melee') bot.dispatch(new MeleeDispatch());
})

await bot.join(process.env.GAME_CODE || process.argv[2]);