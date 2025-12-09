import CommIn from '../comm/CommIn.js';

import { ShellStreak } from '../constants/index.js';

const processEndShellStreakPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const ksType = CommIn.unPackInt8U();

    const player = bot.players[id];
    if (!player) return;

    const streaks = [
        ShellStreak.EggBreaker,
        ShellStreak.OverHeal,
        ShellStreak.DoubleEggs,
        ShellStreak.MiniEgg
    ];

    if (streaks.includes(ksType) && player.streakRewards.includes(ksType))
        player.streakRewards = player.streakRewards.filter((r) => r !== ksType);

    if (ksType === ShellStreak.MiniEgg) player.scale = 1;

    bot.$emit('playerEndStreak', player, ksType);
}

export default processEndShellStreakPacket;