import packet from '#packet';

export class BootPlayerDispatch {
    constructor(uniqueId) {
        this.uniqueId = uniqueId;
    }

    check(bot) {
        return typeof this.uniqueId == 'string' && bot.game.isGameOwner && bot.players.find((player) => player.uniqueId == this.uniqueId);
    }

    execute(bot) {
        new packet.BootPacket(this.uniqueId).execute(bot.game.socket);
    }
}

export default BootPlayerDispatch;