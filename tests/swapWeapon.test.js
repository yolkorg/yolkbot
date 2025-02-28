import Bot from '#bot';

import SpawnDispatch from '#dispatch/SpawnDispatch.js';
import SwapWeaponDispatch from '#dispatch/SwapWeaponDispatch.js';

const bot = new Bot({ name: 'selfbot' });

bot.on('playerJoin', (player) => {
    console.log(player.name, 'joined.');
});

bot.on('chat', (_player, msg) => {
    if (msg == 'spawn') bot.dispatch(new SpawnDispatch());
    if (msg == 'swapWeapon') bot.dispatch(new SwapWeaponDispatch());
})

await bot.join(process.env.GAME_CODE || process.argv[2]);