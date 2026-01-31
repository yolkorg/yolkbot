import CommIn from '../comm/CommIn.js';

import { ShellStreak } from '../enums.js';

const processBeginShellStreakPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const ksType = CommIn.unPackInt8U();

    const player = bot.players[id];
    if (!player) return;

    switch (ksType) {
        case ShellStreak.HardBoiled:
            if (id === bot.me.id) bot.me.shieldHp = 100;
            player.shellStreaks.push(ShellStreak.HardBoiled);
            break;

        case ShellStreak.EggBreaker:
            player.shellStreaks.push(ShellStreak.EggBreaker);
            break;

        case ShellStreak.Restock: {
            player.grenades = 3;

            // main weapon
            if (player.weapons[0] && player.weapons[0].ammo) {
                player.weapons[0].ammo.rounds = player.weapons[0].ammo.capacity;
                player.weapons[0].ammo.store = player.weapons[0].ammo.storeMax;
            }

            // secondary, always cluck9mm
            if (player.weapons[1] && player.weapons[1].ammo) {
                player.weapons[1].ammo.rounds = player.weapons[1].ammo.capacity;
                player.weapons[1].ammo.store = player.weapons[1].ammo.storeMax;
            }
            break;
        }

        case ShellStreak.OverHeal:
            player.hp = Math.min(200, player.hp + 100);
            player.shellStreaks.push(ShellStreak.OverHeal);
            break;

        case ShellStreak.DoubleEggs:
            player.shellStreaks.push(ShellStreak.DoubleEggs);
            break;

        case ShellStreak.MiniEgg:
            player.scale = 0.5;
            player.shellStreaks.push(ShellStreak.MiniEgg);
            break;
    }

    bot.$emit('playerBeginStreak', player, ksType);
}

export default processBeginShellStreakPacket;