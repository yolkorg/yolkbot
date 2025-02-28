import Bot from '#bot';
import { Movements } from '#constants';

import MovementDispatch from '#dispatch/MovementDispatch.js';
import SpawnDispatch from '#dispatch/SpawnDispatch.js';

const bot = new Bot({ name: 'selfbot' });

bot.on('playerJoin', (player) => {
    console.log(player.name, 'joined.');
});

bot.on('chat', (_player, msg) => {
    if (msg == 'spawn') bot.dispatch(new SpawnDispatch());
    if (msg == 'move') bot.dispatch(new MovementDispatch(Movements.FORWARD | Movements.JUMP));
})

await bot.join(process.env.GAME_CODE || process.argv[2]);