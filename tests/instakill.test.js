import Bot from '#bot';

import FireDispatch from '#dispatch/FireDispatch.js';
import LookAtDispatch from '#dispatch/LookAtDispatch.js';
import ReloadDispatch from '#dispatch/ReloadDispatch.js';
import SaveLoadoutDispatch from '#dispatch/SaveLoadoutDispatch.js';
import SpawnDispatch from '#dispatch/SpawnDispatch.js';

const bot = new Bot({ name: 'selfbot' });

bot.on('playerJoin', (player) => {
    console.log(player.name, 'joined.');

    if (player.name !== 'selfbot') return;

    bot.dispatch(new SaveLoadoutDispatch({ gunId: 5 })); // change gun to crackshot
    bot.dispatch(new SpawnDispatch()); // spawn in game
});

bot.on('playerRespawn', (player) => {
    console.log(player.name, 'respawned.');

    if (player.name == 'selfbot') return;

    setTimeout(() => {
        bot.dispatch(new LookAtDispatch(player.id)); // look at the player who sent the message
        bot.dispatch(new FireDispatch()); // fire the gun - this will kill the player as it's a cs
        bot.dispatch(new ReloadDispatch()); // reload the gun for future trolling
    }, 2250);
})

await bot.join(process.env.GAME_CODE || process.argv[2]);