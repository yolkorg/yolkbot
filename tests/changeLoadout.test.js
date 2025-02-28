import Bot from '#bot';

import PauseDispatch from '#dispatch/PauseDispatch.js';
import SaveLoadoutDispatch from '#dispatch/SaveLoadoutDispatch.js';
import SpawnDispatch from '#dispatch/SpawnDispatch.js';

const bot = new Bot({ name: 'selfbot' });

bot.on('playerJoin', () => {
    console.log(bot.name, 'joined.');
});

bot.on('chat', (_player, msg) => {
    if (msg == 'spawn') bot.dispatch(new SpawnDispatch());
    if (msg == 'pause') bot.dispatch(new PauseDispatch());

    if (msg.startsWith('changeGun ')) {
        const gun = parseInt(msg.split(' ')[1]);
        bot.dispatch(new SaveLoadoutDispatch({ gunId: gun }));
    }

    if (msg.startsWith('changeHat ')) {
        const hat = parseInt(msg.split(' ')[1]);
        bot.dispatch(new SaveLoadoutDispatch({ hatId: hat }));
    }

    if (msg.startsWith('changeStamp ')) {
        const stamp = parseInt(msg.split(' ')[1]);
        bot.dispatch(new SaveLoadoutDispatch({ stampId: stamp }));
    }

    if (msg.startsWith('changeColor ')) {
        const color = parseInt(msg.split(' ')[1]);
        bot.dispatch(new SaveLoadoutDispatch({ eggColor: color }));
    }
})

await bot.join(process.env.GAME_CODE || process.argv[2]);