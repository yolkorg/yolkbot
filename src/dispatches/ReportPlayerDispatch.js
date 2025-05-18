import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

export class ReportPlayerDispatch {
    constructor(idOrName, reasons = {}) {
        if (typeof idOrName === 'number') this.id = idOrName
        else if (typeof idOrName === 'string') this.name = idOrName

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

    check(bot) {
        if (!bot.state.joinedGame) return false;

        let target;

        if (this.id) target = bot.players[this.id.toString()];
        else if (this.name) target = bot.players.find(player => player.name === this.name);

        return !!target;
    }

    execute(bot) {
        let target;

        if (this.id) target = bot.players[this.id.toString()];
        else if (this.name) target = bot.players.find(player => player.name === this.name);

        const out = CommOut.getBuffer();
        out.packInt8(CommCode.reportPlayer);
        out.packString(target.uniqueId);
        out.packInt8(this.reasonInt);
        out.send(bot.game.socket);
    }
}

export default ReportPlayerDispatch;