import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { Intents } from '../enums.js';

export class SpawnDispatch {
    validate(): boolean {
        return true;
    }

    check(bot: Bot): boolean {
        const respawnTime = bot.intents.includes(Intents.FASTER_RESPAWN) ? 5000 : 6000;

        if (bot.me.playing) return false;
        if (bot.intents.includes(Intents.OBSERVE_GAME)) return false;
        if (bot.lastDeathTime > 0 && (bot.lastDeathTime + respawnTime) > Date.now()) return false;

        return true;
    }

    execute(bot: Bot): void {
        const out = new CommOut();
        out.packInt8(CommCode.requestRespawn);
        out.send(bot.game.socket);

        bot.state.buffer = [];
    }
}

export default SpawnDispatch;