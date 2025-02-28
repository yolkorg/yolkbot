import Bot from '#bot';

import PathfindDispatch from '#dispatch/PathfindDispatch.js';
import SpawnDispatch from '#dispatch/SpawnDispatch.js';

const bot = new Bot({ name: 'pather' });

bot.on('join', (player) => {
    console.log(player.name, 'joined.');
});

bot.on('chat', (_player, msg) => {
    if (msg == '/spawn') bot.dispatch(new SpawnDispatch());
    if (msg == '/path') bot.dispatch(new PathfindDispatch(_player));
})

await bot.join(process.env.GAME_CODE || process.argv[2]);