import LookToDispatch from '#dispatch/LookToDispatch.js';

const mod = (n, m) => ((n % m) + m) % m;

const PI2 = Math.PI * 2;

const setPrecision = (value) => Math.round(value * 8192) / 8192;
const calculateYaw = (pos) => setPrecision(mod(Math.atan2(-pos.x, -pos.z), PI2));
const calculatePitch = (pos) => setPrecision(Math.atan2(pos.y, Math.hypot(pos.x, pos.z)));

class LookAtPosDispatch {
    idOrName;

    constructor(pos) {
        this.pos = pos;
    }

    check(bot) {
        return bot.me.playing;
    }

    execute(bot) {
        const directionVector = {
            x: this.pos.x - bot.me.position.x,
            y: this.pos.y - bot.me.position.y,
            z: this.pos.z - bot.me.position.z
        };

        const yaw = calculateYaw(directionVector)
        const pitch = calculatePitch(directionVector);

        new LookToDispatch(yaw, pitch).execute(bot);
    }
}

export default LookAtPosDispatch;