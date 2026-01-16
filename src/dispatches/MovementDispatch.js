import { Movement } from '../constants/index.js';

export class MovementDispatch {
    constructor(inputKeys) {
        if (typeof inputKeys === typeof 0) this.inputKeys = inputKeys;
        else if (Array.isArray(inputKeys)) this.inputKeys = inputKeys.reduce((a, b) => a | b, 0);
    }

    validate() {
        if (typeof this.inputKeys !== 'number') return false;

        if (this.inputKeys & Movement.Forward && this.inputKeys & Movement.Backward) return false;
        if (this.inputKeys & Movement.Left && this.inputKeys & Movement.Right) return false;

        return true;
    }

    check(bot) {
        return bot.me.playing;
    }

    execute(bot) {
        bot.state.controlKeys = this.inputKeys;
    }
}

export default MovementDispatch;