import CommIn from '../comm/CommIn.js';

import { CollectType } from '../enums.js';

const processCollectItemPacket = (bot) => {
    const playerId = CommIn.unPackInt8U();
    const type = CommIn.unPackInt8U();
    const applyToWeaponIdx = CommIn.unPackInt8U();
    const id = CommIn.unPackInt16U();

    const player = bot.players[playerId];
    if (!player) return;

    bot.game.collectibles[type] = bot.game.collectibles[type].filter(c => c.id !== id);

    if (type === CollectType.Ammo) {
        const playerWeapon = player.weapons[applyToWeaponIdx];
        if (playerWeapon && playerWeapon.ammo) {
            playerWeapon.ammo.store = Math.min(playerWeapon.ammo.storeMax, playerWeapon.ammo.store + playerWeapon.ammo.pickup);
            bot.$emit('playerCollectAmmo', player, playerWeapon, id);
        }
    }

    if (type === CollectType.Grenade) {
        player.grenades++;
        if (player.grenades > 3) player.grenades = 3;

        bot.$emit('playerCollectGrenade', player, id);
    }
}

export default processCollectItemPacket;