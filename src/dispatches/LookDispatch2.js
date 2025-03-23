export class LookDispatch2 {
    check(bot) {
        return bot.me.playing;
    }

    execute(bot) {
        let x = 0;

        (() => setInterval(() => {
            x += 0.1;
            x %= 2 * Math.PI;
            bot.me.view.yaw = x - Math.PI;
            bot.me.view.pitch = x;
        }, 20))();
    }
}

export default LookDispatch2;