import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class ReportPlayerDispatch {
    constructor(idOrName, reasons = {}) {
        this.idOrName = idOrName;

        this.reasons = [
            !!reasons.cheating,
            !!reasons.harassment,
            !!reasons.offensive,
            !!reasons.other
        ]

        // assume other if a reason is not specified
        if (!this.reasons.includes(true)) this.reasons[3] = true;

        for (let i = 0; i < this.reasons.length; i++)
            if (this.reasons[i] === true)
                this.reasonInt |= (1 << i);
    }

    validate() {
        if (this.reasons.every(reason => reason === false)) return false;

        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);
        if (!target) return false;

        return true;
    }

    check(bot) {
        if (!bot.state.inGame) return false;

        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);
        return !!target;
    }

    execute(bot) {
        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);

        const out = new CommOut();
        out.packInt8(CommCode.reportPlayer);
        out.packString(target.uniqueId);
        out.packInt8(this.reasonInt);
        out.send(bot.game.socket);
    }
}

export default ReportPlayerDispatch;