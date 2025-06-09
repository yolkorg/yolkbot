import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class BootPlayerDispatch {
    constructor(uniqueId) {
        this.uniqueId = uniqueId;
    }

    validate(bot) {
        return typeof this.uniqueId === 'string' &&
            bot.game.isGameOwner &&
            Object.values(bot.players).find((player) => player.uniqueId === this.uniqueId);
    }

    check() {
        return true;
    }

    execute(bot) {
        const out = new CommOut();
        out.packInt8(CommCode.bootPlayer);
        out.packString(this.uniqueId);
        out.send(bot.game.socket);
    }
}

export default BootPlayerDispatch;