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

    $grabPlayer(bot) {
        return bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);
    }

    validate() {
        return typeof this.idOrName === 'string' || typeof this.idOrName === 'number';
    }

    check(bot) {
        if (!bot.me.playing) return false;

        const target = this.$grabPlayer(bot);
        return target && target.playing && target.position && target.position.x;
    }

    execute(bot) {
        const target = this.$grabPlayer(bot);

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