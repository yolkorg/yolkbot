import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

export class PauseDispatch {
    check(bot) {
        return bot.me.playing;
    }

    execute(bot) {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.pause);
        out.send(bot.game.socket);

        setTimeout(() => bot.me.playing = false, 3000);
    }
}

export default PauseDispatch;