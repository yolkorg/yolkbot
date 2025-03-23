const mod = (n, m) => ((n % m) + m) % m;

const PI2 = Math.PI * 2;

const setPrecision = (value) => Math.round(value * 8192) / 8192;
const calculateYaw = (pos) => setPrecision(mod(Math.atan2(-pos.x, -pos.z), PI2));
const calculatePitch = (pos) => setPrecision(Math.atan2(pos.y, Math.hypot(pos.x, pos.z)));

export class LookAtPosDispatch {
    constructor(pos) {
        this.pos = pos;
    }

    check(bot) {
        return bot.me.playing && this.pos && this.pos.x && this.pos.y && this.pos.z;
    }

    execute(bot) {
        const directionVector = {
            x: this.pos.x - bot.me.position.x,
            y: this.pos.y - bot.me.position.y,
            z: this.pos.z - bot.me.position.z
        };

        const yaw = calculateYaw(directionVector)
        const pitch = calculatePitch(directionVector);

        bot.me.view.yaw = yaw;
        bot.me.view.pitch = pitch;
    }
}

export default LookAtPosDispatch;