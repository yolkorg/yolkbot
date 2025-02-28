const mod = (n, m) => ((n % m) + m) % m;

const PI2 = Math.PI * 2;

const setPrecision = (value) => Math.round(value * 8192) / 8192;
const calculateYaw = (pos) => setPrecision(mod(Math.atan2(-pos.x, -pos.z), PI2));
const calculatePitch = (pos) => setPrecision(Math.atan2(pos.y, Math.hypot(pos.x, pos.z)));

class LookAtDispatch {
    idOrName;

    constructor(idOrName) {
        if (typeof idOrName == 'number') this.id = idOrName
        else if (typeof idOrName == 'string') this.name = idOrName
    }

    check(bot) {
        return bot.me.playing;
    }

    execute(bot) {
        let target;

        if (this.id !== undefined) target = bot.players[this.id.toString()];
        else if (this.name !== undefined) target = bot.players.find(player => player.name == this.name);

        const directionVector = {
            x: target.position.x - bot.me.position.x,
            y: target.position.y - bot.me.position.y - 0.05,
            z: target.position.z - bot.me.position.z
        };

        const yaw = calculateYaw(directionVector);
        const pitch = calculatePitch(directionVector);

        bot.me.view.yaw = yaw;
        bot.me.view.pitch = pitch;
    }
}

export default LookAtDispatch;