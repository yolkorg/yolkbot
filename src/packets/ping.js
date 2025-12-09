import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { Intents } from '../enums.js';

const processPingPacket = (bot) => {
    if (!bot.intents.includes(Intents.PING)) return;

    const oldPing = bot.ping;

    bot.ping = Date.now() - bot.lastPingTime;

    bot.$emit('pingUpdate', oldPing, bot.ping);

    setTimeout(() => {
        const out = new CommOut();
        out.packInt8(CommCode.ping);
        out.send(bot.game.socket);
        bot.lastPingTime = Date.now();
    }, 1000);
}

export default processPingPacket;