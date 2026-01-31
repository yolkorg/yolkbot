import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { GameAction } from '../enums.js';

export class ResetGameDispatch {
    validate(): boolean {
        return true;
    }

    check(bot: Bot): boolean {
        return bot.game.isGameOwner;
    }

    execute(bot: Bot): void {
        const out = new CommOut();
        out.packInt8(CommCode.gameAction);
        out.packInt8(GameAction.Reset);
        out.send(bot.game.socket);
    }
}

export default ResetGameDispatch;