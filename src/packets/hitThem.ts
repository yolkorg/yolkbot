import CommIn from '../comm/CommIn.js';

const processHitThemPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const hp = CommIn.unPackInt8U();

    const player = bot.players[id];
    if (!player) return;

    const oldHealth = player.hp;
    player.hp = hp;

    bot.$emit('playerDamage', player, oldHealth, player.hp);
}

export default processHitThemPacket;