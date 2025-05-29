export class MovementDispatch {
    constructor(inputKeys) {
        if (typeof inputKeys === typeof 0) this.inputKeys = inputKeys;
        else if (typeof inputKeys === typeof []) this.inputKeys = inputKeys.reduce((a, b) => a | b, 0);
    }

    check(bot) {
        return bot.me.playing && this.inputKeys;
    }

    execute(bot) {
        bot.state.controlKeys = this.inputKeys;
    }
}

export default MovementDispatch;