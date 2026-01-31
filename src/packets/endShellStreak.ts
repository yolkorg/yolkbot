import CommIn from '../comm/CommIn.js';

import { ShellStreak } from '../enums.js';

const timedStreaks = [
    ShellStreak.EggBreaker,
    ShellStreak.OverHeal,
    ShellStreak.DoubleEggs,
    ShellStreak.MiniEgg
];

const processEndShellStreakPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const ksType = CommIn.unPackInt8U();

    const player = bot.players[id];
    if (!player) return;

    if (timedStreaks.includes(ksType) && player.shellStreaks.includes(ksType))
        player.shellStreaks = player.shellStreaks.filter((r) => r !== ksType);

    if (ksType === ShellStreak.MiniEgg) player.scale = 1;

    bot.$emit('playerEndStreak', player, ksType);
}

export default processEndShellStreakPacket;