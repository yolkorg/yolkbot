class LookToDispatch {
    constructor(yaw, pitch) {
        this.yaw = yaw;
        this.pitch = pitch;
    }

    check(bot) {
        return bot.me.playing;
    }

    execute(bot) {
        if (this.yaw) bot.me.view.yaw = this.yaw;
        if (this.pitch) bot.me.view.pitch = this.pitch;
    }
}

export default LookToDispatch;