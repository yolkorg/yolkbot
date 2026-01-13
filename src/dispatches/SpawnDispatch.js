import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { Intents } from '../enums.js';

export class SpawnDispatch {
    validate() {
        return true;
    }

    check(bot) {
        const respawnTime = bot.intents.FASTER_RESPAWN ? 5000 : 6000;

        if (bot.me.playing) return false;
        if (bot.intents.includes(Intents.OBSERVE_GAME)) return false;
        if (bot.lastDeathTime > 0 && (bot.lastDeathTime + respawnTime) > Date.now()) return false;

        return true;
    }

    execute(bot) {
        const out = new CommOut();
        out.packInt8(CommCode.requestRespawn);
        out.send(bot.game.socket);

        bot.state.buffer = [];
    }
}

export default SpawnDispatch;