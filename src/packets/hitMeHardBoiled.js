import CommIn from '../comm/CommIn.js';

import { ShellStreak } from '../constants/index.js';

const processHitMeHardBoiledPacket = (bot) => {
    const shieldHealth = CommIn.unPackInt8U();
    const playerHealth = CommIn.unPackInt8U();
    const dx = CommIn.unPackFloat();
    const dz = CommIn.unPackFloat();

    if (!bot.me) return;

    bot.me.shieldHp = shieldHealth;
    bot.me.hp = playerHealth;

    if (bot.me.shieldHp <= 0) {
        bot.me.streakRewards = bot.me.streakRewards.filter((r) => r !== ShellStreak.HardBoiled);
        bot.$emit('selfShieldLost', bot.me.hp, { dx, dz });
    } else bot.$emit('selfShieldHit', bot.me.shieldHp, bot.me.hp, { dx, dz });
}

export default processHitMeHardBoiledPacket;