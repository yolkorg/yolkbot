import Bot from '#bot';

const bot = new Bot({ name: 'selfbot' });

bot.on('playerJoin', (player) => {
    console.log(player.name, 'joined.');
});

bot.onAny((event, ...args) => {
    if (!['packet', 'tick'].includes(event)) console.log('onAny', event, ...args);
});

await bot.join(process.env.GAME_CODE || process.argv[2]);