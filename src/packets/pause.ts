import CommIn from '../comm/CommIn.js';

import { ZoneLeaveReason } from '../enums.js';

const processPausePacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const player = bot.players[id];

    if (player) {
        player.playing = false;
        if (player.shellStreaks) player.shellStreaks = [];

        bot.$emit('playerPause', player);

        if (player.inKotcZone) {
            player.inKotcZone = false;
            bot.$emit('playerLeaveZone', player, ZoneLeaveReason.Despawned);
        }
    }
}

export default processPausePacket;