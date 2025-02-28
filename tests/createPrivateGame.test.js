import Bot from '#bot';

import BootPlayerDispatch from '#dispatch/BootPlayerDispatch.js';
import GameOptionsDispatch from '#dispatch/GameOptionsDispatch.js';

import Matchmaker from '../src/matchmaker.js';

import { Maps } from '../src/constants/maps.js';

const bot = new Bot({ name: 'selfbot' });

const mm = new Matchmaker();

await mm.getRegions();

bot.matchmaker = mm;

await bot.createPrivateGame({
    region: mm.getRandomRegion(),
    mode: mm.getRandomGameMode(),
    map: Maps[Math.floor(Math.random() * Maps.length)].name
});

console.log('created private game, joining...');

bot.on('playerJoin', (player) => {
    console.log(player.name, 'joined.');
});

bot.on('chat', (player, msg) => {
    if (msg.startsWith('gravity ')) {
        const gravity = parseFloat(msg.split(' ')[1]);
        bot.game.options.gravity = gravity;
        bot.dispatch(new GameOptionsDispatch());
    }

    if (msg.startsWith('damage ')) {
        const damage = parseFloat(msg.split(' ')[1]);
        bot.game.options.damage = damage;
        bot.dispatch(new GameOptionsDispatch());
    }

    if (msg.startsWith('healthRegen ')) {
        const healthRegen = parseFloat(msg.split(' ')[1]);
        bot.game.options.healthRegen = healthRegen;
        bot.dispatch(new GameOptionsDispatch());
    }

    if (msg == 'lock') {
        bot.game.options.locked = !bot.game.options.locked;
        bot.dispatch(new GameOptionsDispatch());
    }

    if (msg == 'noTeamChange') {
        bot.game.options.noTeamChange = !bot.game.options.noTeamChange;
        bot.dispatch(new GameOptionsDispatch());
    }

    if (msg == 'noTeamShuffle') {
        bot.game.options.noTeamShuffle = !bot.game.options.noTeamShuffle;
        bot.dispatch(new GameOptionsDispatch());
    }

    if (msg.startsWith('disableWeapon ')) {
        const weaponId = parseFloat(msg.split(' ')[1]);
        bot.game.options.weaponsDisabled[weaponId] = !bot.game.options.weaponsDisabled[weaponId];
        bot.dispatch(new GameOptionsDispatch());
    }

    if (msg == 'bootMe') {
        bot.dispatch(new BootPlayerDispatch(player.uniqueId));
    }
})

await bot.join();

console.log('bot joined private game', bot.game.code);