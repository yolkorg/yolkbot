import CommIn from '../comm/CommIn.js';

const processReloadPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const player = bot.players[id];

    if (!player) return;

    const playerActiveWeapon = player.weapons[player.activeGun];

    if (playerActiveWeapon.ammo) {
        const maxLoad = Math.min(playerActiveWeapon.ammo.capacity, playerActiveWeapon.ammo.reload);
        const needed = Math.max(0, maxLoad - playerActiveWeapon.ammo.rounds);
        const newRounds = Math.min(needed, playerActiveWeapon.ammo.store);

        playerActiveWeapon.ammo.rounds += newRounds;
        playerActiveWeapon.ammo.store -= newRounds;
    }

    bot.$emit('playerReload', player, playerActiveWeapon);
}

export default processReloadPacket;