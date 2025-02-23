import packet from '#packet';

class SpawnDispatch {
    check(bot) {
        if (!bot.me.playing && (bot.lastDeathTime + 6000) < Date.now()) { return true; }

        // console.log("Dispatch failed: < 6s since last spawn");

        return false;
    }

    execute(bot) {
        new packet.RespawnPacket().execute(bot.gameSocket);

        bot.lastSpawnedTime = Date.now();
        bot.me.playing = true;
    }
}

export default SpawnDispatch;