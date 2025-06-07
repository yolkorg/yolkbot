import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

export class SpawnDispatch {
    validate() {
        return true;
    }

    check(bot) {
        if (bot.me.playing) return false;
        if ((bot.lastDeathTime + 6000) < Date.now()) return false;
        if (bot.intents.includes(bot.Intents.OBSERVE_GAME)) return false;

        return true;
    }

    execute(bot) {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.requestRespawn);
        out.send(bot.game.socket);

        bot.state.buffer = [];
    }
}

export default SpawnDispatch;