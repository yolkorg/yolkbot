import CommIn from '../comm/CommIn.js';

import { GameOptionFlag } from '../constants/index.js';

const CCGameOptionFlag = Object.fromEntries(Object.entries(GameOptionFlag).map(([k, v]) => [k[0].toLowerCase() + k.slice(1), v]));

const processGameOptionsPacket = (bot) => {
    const oldOptions = structuredClone(bot.game.options);

    let gravity = CommIn.unPackInt8U();
    let damage = CommIn.unPackInt8U();
    let healthRegen = CommIn.unPackInt8U();

    if (gravity < 1 || gravity > 4) gravity = 4;
    if (damage < 0 || damage > 8) damage = 4;
    if (healthRegen > 16) healthRegen = 4;

    bot.game.options.gravity = gravity / 4;
    bot.game.options.damage = damage / 4;
    bot.game.options.healthRegen = healthRegen / 4;

    const rawFlags = CommIn.unPackInt8U();

    Object.keys(CCGameOptionFlag).forEach((optionFlagName) => {
        const value = rawFlags & CCGameOptionFlag[optionFlagName] ? 1 : 0;
        bot.game.options[optionFlagName] = value;
    });

    bot.game.options.weaponsDisabled = Array.from({ length: 7 }, () => CommIn.unPackInt8U() === 1);
    bot.game.options.mustUseSecondary = bot.game.options.weaponsDisabled.every((v) => v);

    bot.$emit('gameOptionsChange', oldOptions, bot.game.options);
}

export default processGameOptionsPacket;