import { Movements } from '../constants/index.js';

export class MovementDispatch {
    constructor(inputKeys) {
        if (typeof inputKeys === typeof 0) this.inputKeys = inputKeys;
        else if (typeof inputKeys === typeof []) this.inputKeys = inputKeys.reduce((a, b) => a | b, 0);
    }

    validate() {
        if (typeof this.inputKeys !== 'number') return false;

        if (this.inputKeys & Movements.FORWARD && this.inputKeys & Movements.BACKWARD) return false;
        if (this.inputKeys & Movements.LEFT && this.inputKeys & Movements.RIGHT) return false;

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