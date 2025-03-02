import Bot from '#bot';

import LookAtDispatch from '#dispatch/LookAtDispatch.js';
import SpawnDispatch from '#dispatch/SpawnDispatch.js';

const bot = new Bot({ name: 'selfbot' });

bot.on('playerJoin', (player) => {
    console.log(player.name, 'joined.');
});

bot.on('chat', (_player, msg) => {
    if (msg == 's') bot.dispatch(new SpawnDispatch());
    if (msg == 'l') bot.dispatch(new LookAtDispatch(_player.id));
})

await bot.join(process.env.GAME_CODE || process.argv[2]);