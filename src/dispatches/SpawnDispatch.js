import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { Intents } from '../enums.js';

export class SpawnDispatch {
    validate() {
        return true;
    }

    check(bot) {
        if (bot.me.playing) return false;
        if ((bot.lastDeathTime + 6000) < Date.now()) return false;
        if (bot.intents.includes(Intents.OBSERVE_GAME)) return false;

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