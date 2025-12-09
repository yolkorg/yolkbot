import CommIn from '../comm/CommIn.js';

const processSwapWeaponPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const newWeaponId = CommIn.unPackInt8U();
    const player = bot.players[id];

    if (player) {
        player.activeGun = newWeaponId;
        bot.$emit('playerSwapWeapon', player, newWeaponId);
    }
}

export default processSwapWeaponPacket;