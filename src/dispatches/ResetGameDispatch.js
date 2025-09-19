import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';
import { GameAction } from '../constants/index.js';

export class ResetGameDispatch {
    validate() {
        return true;
    }

    check(bot) {
        return bot.game.isGameOwner;
    }

    execute(bot) {
        const out = new CommOut();
        out.packInt8(CommCode.gameAction);
        out.packInt8(GameAction.Reset);
        out.send(bot.game.socket);
    }
}

export default ResetGameDispatch;