import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class PauseDispatch {
    validate() {
        return true;
    }

    check(bot) {
        return bot.me.playing;
    }

    execute(bot) {
        const out = new CommOut();
        out.packInt8(CommCode.pause);
        out.send(bot.game.socket);

        setTimeout(() => bot.me.playing = false, 3000);
    }
}

export default PauseDispatch;