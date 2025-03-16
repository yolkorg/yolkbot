import packet from '#packet';

export class SpawnDispatch {
    check(bot) {
        if (!bot.me.playing && (bot.lastDeathTime + 6000) < Date.now()) return true;

        return false;
    }

    execute(bot) {
        new packet.RespawnPacket().execute(bot.game.socket);

        bot.lastSpawnedTime = Date.now();
        bot.me.playing = true;
    }
}

export default SpawnDispatch;