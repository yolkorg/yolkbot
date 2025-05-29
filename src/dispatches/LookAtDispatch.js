const mod = (n, m) => ((n % m) + m) % m;

const PI2 = Math.PI * 2;

const setPrecision = (value) => Math.round(value * 8192) / 8192;
const calculateYaw = (pos) => setPrecision(mod(Math.atan2(-pos.x, -pos.z), PI2));
const calculatePitch = (pos) => setPrecision(Math.atan2(pos.y, Math.hypot(pos.x, pos.z)));

export class LookAtDispatch {
    idOrName;

    constructor(idOrName) {
        this.idOrName = idOrName;
    }

    check(bot) {
        if (!bot.me.playing) return false;

        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);
        return !!target;
    }

    execute(bot) {
        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);

        const directionVector = {
            x: target.position.x - bot.me.position.x,
            y: target.position.y - bot.me.position.y - 0.05,
            z: target.position.z - bot.me.position.z
        };

        const yaw = calculateYaw(directionVector);
        const pitch = calculatePitch(directionVector);

        bot.state.yaw = yaw;
        bot.state.pitch = pitch;
    }
}

export default LookAtDispatch;