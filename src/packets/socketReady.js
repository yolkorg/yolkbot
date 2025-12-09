import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { Intents } from '../enums.js';

const processSocketReadyPacket = (bot) => {
    const out = new CommOut();
    out.packInt8(bot.intents.includes(Intents.OBSERVE_GAME) ? CommCode.observeGame : CommCode.joinGame);

    out.packString(bot.game.raw.uuid);
    out.packInt8(+bot.intents.includes(Intents.VIP_HIDE_BADGE));
    out.packInt8(bot.state.weaponIdx || bot.account?.loadout?.classIdx || 0);
    out.packString(bot.state.name);

    out.packInt32(bot.account.session);
    out.packString(bot.account.sessionId);
    out.packString(bot.account.firebaseId);

    out.send(bot.game.socket);
}

export default processSocketReadyPacket;