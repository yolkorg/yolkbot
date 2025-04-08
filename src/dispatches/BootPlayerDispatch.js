import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

export class BootPlayerDispatch {
    constructor(uniqueId) {
        this.uniqueId = uniqueId;
    }

    check(bot) {
        return typeof this.uniqueId == 'string' && bot.game.isGameOwner && bot.players.find((player) => player.uniqueId == this.uniqueId);
    }

    execute(bot) {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.bootPlayer);
        out.packString(this.uniqueId);
        out.send(bot.game.socket);
    }
}

export default BootPlayerDispatch;