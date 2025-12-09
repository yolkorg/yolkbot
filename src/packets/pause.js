import CommIn from '../comm/CommIn.js';

const processPausePacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const player = bot.players[id];

    if (player) {
        player.playing = false;
        if (player.streakRewards) player.streakRewards = [];

        bot.$emit('playerPause', player);

        if (player.inKotcZone) {
            player.inKotcZone = false;
            bot.$emit('playerLeaveZone', player);
        }
    }
}

export default processPausePacket;