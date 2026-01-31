import CommIn from '../comm/CommIn.js';

import { findItemById } from '../constants/findItemById.js';

import { Intents, ItemType } from '../enums.js';

const processExplodePacket = (bot) => {
    const itemType = CommIn.unPackInt8U();
    let item = CommIn.unPackInt16U();
    const x = CommIn.unPackFloat();
    const y = CommIn.unPackFloat();
    const z = CommIn.unPackFloat();
    const damage = CommIn.unPackInt8U();
    const radius = CommIn.unPackFloat();

    if (bot.intents.includes(Intents.COSMETIC_DATA)) item = findItemById(item);

    if (itemType === ItemType.Grenade) bot.$emit('grenadeExplode', item, { x, y, z }, damage, radius);
    else bot.$emit('rocketHit', { x, y, z }, damage, radius);
}

export default processExplodePacket;