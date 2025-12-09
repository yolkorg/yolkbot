import CommIn from '../comm/CommIn.js';

const processMeleePacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const player = bot.players[id];

    if (player) bot.$emit('playerMelee', player);
}

export default processMeleePacket;