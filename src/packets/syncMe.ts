import CommIn from '../comm/CommIn.js';

const processSyncMePacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const player = bot.players[id];

    CommIn.unPackInt8U(); // stateIdx

    const serverStateIdx = CommIn.unPackInt8U();

    const newX = CommIn.unPackFloat();
    const newY = CommIn.unPackFloat();
    const newZ = CommIn.unPackFloat();

    bot.me.climbing = !!CommIn.unPackInt8U();

    CommIn.unPackInt8U(); // rounds
    CommIn.unPackInt8U(); // store

    if (!player) return;

    bot.state.serverStateIdx = serverStateIdx;

    const oldX = player.position.x;
    const oldY = player.position.y;
    const oldZ = player.position.z;

    player.position.x = newX;
    player.position.y = newY;
    player.position.z = newZ;

    if (oldX !== newX || oldY !== newY || oldZ !== newZ)
        bot.$emit('playerMove', player, { x: oldX, y: oldY, z: oldZ }, { x: newX, y: newY, z: newZ });
}

export default processSyncMePacket;