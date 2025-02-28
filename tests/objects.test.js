import Bot from '#bot';

import ChatDispatch from '#dispatch/ChatDispatch.js';
import SpawnDispatch from '#dispatch/SpawnDispatch.js';

const bot = new Bot({ name: 'selfbot' });

bot.on('playerJoin', (player) => {
    console.log(player.name, 'joined.');
});

bot.on('chat', (_player, msg) => {
    if (msg == 'spawn') bot.dispatch(new SpawnDispatch());

    if (msg == 'activeWeapon') bot.dispatch(new ChatDispatch(`using the ${bot.me.activeGun == 1 ? 'secondary' : 'primary'}`));
    if (msg == 'weapons0') console.log(bot.players[0].weapons);
    if (msg == 'selfWeapons') console.log(bot.me.weapons);

    if (msg == 'game') console.log(bot.game);
    if (msg == 'players') console.log(bot.players);
    if (msg == 'player0') console.log(bot.players[0]);
})

await bot.join(process.env.GAME_CODE || process.argv[2]);