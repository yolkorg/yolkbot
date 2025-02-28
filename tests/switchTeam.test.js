import Bot from '#bot';

import SpawnDispatch from '#dispatch/SpawnDispatch.js';
import SwitchTeamDispatch from '#dispatch/SwitchTeamDispatch.js';

const bot = new Bot({ name: 'selfbot' });

bot.on('playerJoin', (player) => {
    console.log(player.name, 'joined.');
});

bot.on('chat', (_player, msg) => {
    if (msg == 'spawn') bot.dispatch(new SpawnDispatch());
    if (msg == 'switchTeam') bot.dispatch(new SwitchTeamDispatch());
})

await bot.join(process.env.GAME_CODE || process.argv[2]);