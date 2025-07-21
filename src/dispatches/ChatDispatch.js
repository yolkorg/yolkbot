import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class ChatDispatch {
    constructor(msg) {
        this.msg = msg;
    }

    validate() {
        if (typeof this.msg !== 'string') return false;
        if (this.msg.length < 1 || this.msg.length > 64) return false;

        return true;
    }

    check(bot) {
        if (!bot.state?.inGame) return false;
        if (!bot.game.isPrivate && !bot.account.adminRoles && bot.state.chatLines >= 2) return false;
        if (!bot.game.isPrivate && !bot.account.emailVerified && !bot.account.isAged) return false;

        return true;
    }

    execute(bot) {
        bot.state.chatLines++;

        const out = new CommOut();
        out.packInt8(CommCode.chat);
        out.packString(this.msg);
        out.send(bot.game.socket);
    }
}

export default ChatDispatch;