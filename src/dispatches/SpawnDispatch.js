import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

export class SpawnDispatch {
    check(bot) {
        if (!bot.me.playing && (bot.lastDeathTime + 6000) < Date.now()) return true;

        return false;
    }

    execute(bot) {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.requestRespawn);
        out.send(bot.game.socket);

        bot.lastSpawnedTime = Date.now();
        bot.me.playing = true;
    }
}

export default SpawnDispatch;