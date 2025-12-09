import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

const processEventModifierPacket = (bot) => {
    const out = new CommOut();
    out.packInt8(CommCode.eventModifier);
    out.send(bot.game.socket);
}

export default processEventModifierPacket;