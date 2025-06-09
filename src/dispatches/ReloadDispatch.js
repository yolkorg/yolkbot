import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class ReloadDispatch {
    validate() {
        return true;
    }

    check(bot) {
        return bot.me.playing && !bot.state.reloading && !bot.state.swappingGun && !bot.state.usingMelee;
    }

    execute(bot) {
        const out = new CommOut();
        out.packInt8(CommCode.reload);
        out.send(bot.game.socket);

        const playerActiveWeapon = bot.me.weapons[bot.me.activeGun];

        if (playerActiveWeapon.ammo) {
            const newRounds = Math.min(
                Math.min(playerActiveWeapon.ammo.capacity, playerActiveWeapon.ammo.reload) - playerActiveWeapon.ammo.rounds,
                playerActiveWeapon.ammo.store
            );

            playerActiveWeapon.ammo.rounds += newRounds;
            playerActiveWeapon.ammo.store -= newRounds;
        }

        bot.emit('playerReload', bot.me, playerActiveWeapon);

        const activeWeapon = bot.me.weapons[bot.me.activeGun];
        const isLongTime = activeWeapon.ammo.rounds < 1;

        bot.state.reloading = true;
        setTimeout(() => bot.state.reloading = false, isLongTime ? activeWeapon.longReloadTime : activeWeapon.shortReloadTime);
    }
}

export default ReloadDispatch;