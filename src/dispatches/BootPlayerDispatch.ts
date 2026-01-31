import Bot from '../bot/bot.js';
import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class BootPlayerDispatch {
    uniqueId: string;

    constructor(uniqueId: string) {
        this.uniqueId = uniqueId;
    }

    validate(bot: Bot): boolean {
        return typeof this.uniqueId === 'string' &&
            bot.game.isGameOwner &&
            Object.values(bot.players).find((player) => player.uniqueId === this.uniqueId);
    }

    check(): boolean {
        return true;
    }

    execute(bot: Bot): void {
        const out = new CommOut();
        out.packInt8(CommCode.bootPlayer);
        out.packString(this.uniqueId);
        out.send(bot.game.socket);
    }
}

export default BootPlayerDispatch;