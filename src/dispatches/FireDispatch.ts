import Bot from '../bot/bot';

export class FireDispatch {
    amount: number;

    constructor(amount: number) {
        this.amount = amount || 1;
    }

    validate(): boolean {
        return this.amount >= 1;
    }

    check(bot: Bot): boolean {
        return bot.me.playing &&
            !bot.state.reloading &&
            !bot.state.swappingGun &&
            !bot.state.usingMelee &&
            bot.me.weapons[bot.me.activeGun].ammo.rounds >= this.amount;
    }

    execute(bot: Bot): void {
        bot.state.shotsFired += this.amount || 1;
    }
}

export default FireDispatch;