export class FireDispatch {
    constructor(amount) {
        this.amount = amount || 1;
    }

    validate() {
        return this.amount >= 1;
    }

    check(bot) {
        return bot.me.playing &&
            !bot.state.reloading &&
            !bot.state.swappingGun &&
            !bot.state.usingMelee &&
            bot.me.weapons[bot.me.activeGun].ammo.rounds >= this.amount;
    }

    execute(bot) {
        bot.state.shotsFired += this.amount || 1;
    }
}

export default FireDispatch;