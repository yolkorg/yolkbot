import Bot from '#bot';

import SpawnDispatch from '#dispatch/SpawnDispatch.js';

const NUM_PLAYERS = 5;

for (let i = 0; i < NUM_PLAYERS; i++) {
    const bot = new Bot({ name: process.argv[3] || 'selfbot' });

    bot.on('playerJoin', (player) => {
        console.log(player.name, 'joined.');
    });

    bot.on('chat', (player, msg) => {
        // we use i == 0 to confirm that it's just logged by one bot
        // since it would log NUM_PLAYERS times otherwise
        if (i == 0) console.log(`> ${player.name}: ${msg}`);

        if (msg == 'spawn') bot.dispatch(new SpawnDispatch());
    });

    bot.on('playerRespawn', (p) => {
        if (bot.me.name == p.name) bot.dispatch(new SpawnDispatch());
    });

    await bot.join(process.env.GAME_CODE || process.argv[2])
}