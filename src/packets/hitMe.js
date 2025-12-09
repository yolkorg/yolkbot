import CommIn from '../comm/CommIn.js';

const processHitMePacket = (bot) => {
    const hp = CommIn.unPackInt8U();

    CommIn.unPackFloat();
    CommIn.unPackFloat();

    const oldHealth = bot.me.hp;
    bot.me.hp = hp;

    bot.$emit('playerDamage', bot.me, oldHealth, bot.me.hp);
}

export default processHitMePacket;