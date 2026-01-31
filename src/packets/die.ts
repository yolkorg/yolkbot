import CommIn from '../comm/CommIn.js';

import { ZoneLeaveReason } from '../enums.js';

const processDiePacket = (bot) => {
    const killedId = CommIn.unPackInt8U();
    const killerId = CommIn.unPackInt8U();

    CommIn.unPackInt8U(); // timeUntilRespawn
    CommIn.unPackInt8U(); // killerLastDamageCause

    const damageCauseInt = CommIn.unPackInt8U();

    const killed = bot.players[killedId];
    const killer = bot.players[killerId];

    const oldKilled = killed ? structuredClone(killed) : null;

    if (bot.me && killed) {
        if (killed.id === bot.me.id) {
            bot.lastDeathTime = Date.now();

            if (bot.pathing.activePath) {
                bot.pathing.activePath = null;
                bot.pathing.activeNode = null;
                bot.pathing.activeNodeIdx = 0;
            }

            bot.state.controlKeys = 0;
        }

        killed.playing = false;
        killed.streak = 0;
        killed.hp = 100;
        killed.spawnShield = 0;

        killed.stats.totalDeaths++;

        if (killed.inKotcZone) {
            killed.inKotcZone = false;
            bot.$emit('playerLeaveZone', killed, ZoneLeaveReason.Killed);
        }
    }

    if (killer) {
        killer.streak++;
        killer.stats.totalKills++;

        if (killer.streak > killer.stats.bestStreak) killer.stats.bestStreak = killer.streak;
    }

    bot.$emit('playerDeath', killed, killer, oldKilled, damageCauseInt);
}

export default processDiePacket;