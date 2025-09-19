import CommOut from "../comm/CommOut";
import CommCode from "../constants/CommCode";

export class GameActionsDispatch {
    constructor() {
        this.gameActions = {
            Reset: 1,
            Pause: 2
        };
    }

    check(bot) {
        return bot.game.isGameOwner;
    }

    execute(bot) {
        const out = new CommOut();
		out.packInt8(CommCode.gameAction);
		out.packInt8(this.gameActions.Reset);
		out.send(bot.game.socket);
    }
}

export default GameActionsDispatch;