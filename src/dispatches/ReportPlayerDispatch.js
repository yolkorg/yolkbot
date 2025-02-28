import packet from '#packet';

class ReportPlayerDispatch {
    constructor(idOrName, reasons = {}) {
        if (typeof idOrName == 'number') this.id = idOrName
        else if (typeof idOrName == 'string') this.name = idOrName

        this.reasons = [
            !!reasons.cheating,
            !!reasons.harassment,
            !!reasons.offensive,
            !!reasons.other
        ]

        // assume other if a reason is not specified
        if (!this.reasons.includes(true)) this.reasons[3] = true;

        for (let i = 0; i < this.reasons.length; i++)
            if (this.reasons[i] == true)
                this.reasonInt |= (1 << i);
    }

    check(bot) {
        return bot.state.joinedGame;
    }

    execute(bot) {
        let target;

        if (this.id !== 'undefined') target = bot.players[this.id.toString()];
        else if (this.name !== 'undefined') target = bot.players.find(player => player.name == this.name);

        if (!target) throw new Error('target player for ReportPlayerDispatch not found')

        new packet.ReportPacket(target, this.reasonInt).execute(bot.gameSocket);
    }
}

export default ReportPlayerDispatch;