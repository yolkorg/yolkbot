import CommIn from '../comm/CommIn.js';

const processPlayerInfoPacket = (bot) => {
    const playerId = CommIn.unPackInt8U();
    const playerDBId = CommIn.unPackString(128);
    const playerIp = CommIn.unPackString(32);

    const player = bot.players[playerId];
    if (!player) return;

    player.admin = {
        ip: playerIp,
        dbId: playerDBId
    };

    bot.$emit('playerInfo', player, playerIp, playerDBId);
}

export default processPlayerInfoPacket;