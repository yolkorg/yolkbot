import CommIn from '../comm/CommIn.js';

const processSpawnItemPacket = (bot) => {
    const id = CommIn.unPackInt16U();
    const type = CommIn.unPackInt8U();
    const x = CommIn.unPackFloat();
    const y = CommIn.unPackFloat();
    const z = CommIn.unPackFloat();

    bot.game.collectables[type].push({ id, x, y, z });
    bot.$emit('spawnItem', type, { x, y, z }, id);
}

export default processSpawnItemPacket;