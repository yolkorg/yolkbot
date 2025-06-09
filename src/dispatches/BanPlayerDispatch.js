import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { BanDuration } from '../constants/index.js';

export class BanPlayerDispatch {
    constructor(uniqueId, duration, reason = '') {
        this.uniqueId = uniqueId;
        this.duration = duration;
        this.reason = reason;
    }

    validate(bot) {
        if (typeof this.uniqueId !== 'string' || typeof this.reason !== 'string') return false;
        if (typeof this.duration !== 'number' || !Object.values(BanDuration).some(d => this.duration === d)) return false;
        if (!(bot.account.adminRoles & 4)) return false;

        return true;
    }

    check() {
        return true;
    }

    execute(bot) {
        const out = new CommOut();
        out.packInt8(CommCode.banPlayer);
        out.packString(this.uniqueId);
        out.packString(this.reason);
        out.packInt8(this.duration);
        out.send(bot.game.socket);
    }
}

export default BanPlayerDispatch;