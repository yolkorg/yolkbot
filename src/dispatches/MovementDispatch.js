export class MovementDispatch {
    constructor(controlKeys) {
        if (typeof controlKeys == typeof 0) {
            this.controlKeys = controlKeys;
        } else if (typeof controlKeys == typeof []) {
            this.controlKeys = controlKeys.reduce((a, b) => a | b, 0);
        }
    }

    check(bot) {
        return bot.me.playing && this.controlKeys;
    }

    execute(bot) {
        bot.controlKeys = this.controlKeys;
    }
}

export default MovementDispatch;