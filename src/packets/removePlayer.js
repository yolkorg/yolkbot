import CommIn from '../comm/CommIn.js';

const processRemovePlayerPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const removedPlayer = structuredClone(bot.players[id]);

    delete bot.players[id];

    bot.$emit('playerLeave', removedPlayer);
}

export default processRemovePlayerPacket;