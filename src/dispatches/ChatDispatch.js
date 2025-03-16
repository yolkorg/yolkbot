import packet from '#packet';

export class ChatDispatch {
    constructor(msg, noLimit = false) {
        this.msg = msg;
        this.noLimit = noLimit;
    }

    check(bot) {
        if (typeof this.msg !== 'string') return false;
        if (this.msg.length < 1 || this.msg.length > 64) return false;
        if (!bot.state.joinedGame) return false;
        if ((bot.lastChatTime + 3000) > Date.now() && !this.noLimit) return false;
        if (!bot.game.isPrivate && !bot.account.emailVerified && bot.account.accountAge < (1e3 * 60 * 60 * 12)) return false;

        return true;
    }

    execute(bot) {
        new packet.ChatPacket(this.msg).execute(bot.game.socket);
        bot.lastChatTime = Date.now();
    }
}

export default ChatDispatch;