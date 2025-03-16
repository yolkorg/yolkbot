import packet from '#packet';

export class ThrowGrenadeDispatch {
    constructor(power = 1) {
        this.power = power;
    }

    check(bot) {
        return bot.me.playing &&
            !bot.state.reloading &&
            !bot.state.swappingGun &&
            !bot.state.usingMelee &&
            this.power >= 0 &&
            this.power <= 1;
    }

    execute(bot) {
        new packet.ThrowGrenadePacket(this.power).execute(bot.game.socket);
    }
}

export default ThrowGrenadeDispatch;