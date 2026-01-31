import Bot from '../bot/bot.js';
import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class ChatDispatch {
    msg: string;

    constructor(msg: string) {
        this.msg = msg;
    }

    validate(bot: Bot): boolean {
        if (typeof this.msg !== 'string') return false;
        if (this.msg.length < 1 || this.msg.length > 64) return false;
        if (!bot.game.isPrivate && !bot.account.emailVerified && !bot.account.isAged && !bot.account.isCG) return false;

        return true;
    }

    check(bot: Bot): boolean {
        if (!bot.state?.inGame) return false;
        if (!bot.game.isPrivate && !bot.account.adminRoles && bot.state.chatLines >= 2) return false;

        return true;
    }

    execute(bot: Bot): void {
        bot.state.chatLines++;

        const out = new CommOut();
        out.packInt8(CommCode.chat);
        out.packString(this.msg);
        out.send(bot.game.socket);
    }
}

export default ChatDispatch;