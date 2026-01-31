import Bot from '../bot/bot.js';
import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { BanDuration } from '../enums.js';

export class BanPlayerDispatch {
    uniqueId: string;
    duration: number;
    reason?: string;

    constructor(uniqueId: string, duration: number, reason = '') {
        this.uniqueId = uniqueId;
        this.duration = duration;
        this.reason = reason;
    }

    validate(bot: Bot): boolean {
        if (typeof this.uniqueId !== 'string' || typeof this.reason !== 'string') return false;
        if (typeof this.duration !== 'number' || !(d in BanDuration)) return false;
        if (!(bot.account.adminRoles & 4)) return false;

        return true;
    }

    check(): boolean {
        return true;
    }

    execute(bot: Bot): void {
        const out = new CommOut();
        out.packInt8(CommCode.banPlayer);
        out.packString(this.uniqueId);
        out.packString(this.reason);
        out.packInt8(this.duration);
        out.send(bot.game.socket);
    }
}

export default BanPlayerDispatch;