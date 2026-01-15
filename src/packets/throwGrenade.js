import CommIn from '../comm/CommIn.js';

const processThrowGrenadePacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const x = CommIn.unPackFloat();
    const y = CommIn.unPackFloat();
    const z = CommIn.unPackFloat();
    const dx = CommIn.unPackFloat();
    const dy = CommIn.unPackFloat();
    const dz = CommIn.unPackFloat();

    const player = bot.players[id];

    if (player) {
        if (player.grenades > 0) player.grenades--;
        bot.$emit('playerThrowGrenade', player, { x, y, z }, { x: dx, y: dy, z: dz });
    }
}

export default processThrowGrenadePacket;