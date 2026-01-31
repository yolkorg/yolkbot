import CommIn from '../comm/CommIn.js';

const processFirePacket = (bot) => {
    const id = CommIn.unPackInt8U();

    const bullet = {
        posX: CommIn.unPackFloat(),
        posY: CommIn.unPackFloat(),
        posZ: CommIn.unPackFloat(),
        dirX: CommIn.unPackFloat(),
        dirY: CommIn.unPackFloat(),
        dirZ: CommIn.unPackFloat()
    };

    const player = bot.players[id];
    if (!player) return;

    const playerWeapon = player.weapons[player.activeGun];

    if (playerWeapon && playerWeapon.ammo) {
        playerWeapon.ammo.rounds--;
        bot.$emit('playerFire', player, playerWeapon, bullet);
    }
}

export default processFirePacket;