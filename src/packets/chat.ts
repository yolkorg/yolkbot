import CommIn from '../comm/CommIn.js';

const processChatPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const msgFlags = CommIn.unPackInt8U();
    const text = CommIn.unPackString();

    const player = bot.players[id];
    if (player) bot.$emit('chat', player, text, msgFlags);
};

export default processChatPacket;