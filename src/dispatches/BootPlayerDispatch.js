import packet from '#packet';

export class BootPlayerDispatch {
    constructor(uniqueId) {
        this.uniqueId = uniqueId;
    }

    check(bot) {
        return typeof this.uniqueId == 'string' && bot.game.isGameOwner;
    }

    execute(bot) {
        new packet.BootPacket(this.uniqueId).execute(bot.gameSocket);
    }
}

export default BootPlayerDispatch;