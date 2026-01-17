import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class ReloadDispatch {
    validate() {
        return true;
    }

    check(bot) {
        return bot.me.playing &&
            !bot.state.reloading &&
            !bot.state.swappingGun &&
            !bot.state.usingMelee &&
            bot.me.weapons[bot.me.activeGun].ammo?.rounds < bot.me.weapons[bot.me.activeGun].ammo?.capacity &&
            bot.me.weapons[bot.me.activeGun].ammo?.store > 0;
    }

    execute(bot) {
        const out = new CommOut();
        out.packInt8(CommCode.reload);
        out.send(bot.game.socket);

        const playerActiveWeapon = bot.me.weapons[bot.me.activeGun];
        const isEmpty = playerActiveWeapon.ammo.rounds < 1;

        bot.$emit('playerStartReload', bot.me, playerActiveWeapon);

        bot.state.reloading = true;
        setTimeout(() => {
            if (!bot.me || bot.hasQuit) return;

            bot.state.reloading = false;

            const latestWeapon = bot.me.weapons[bot.me.activeGun];

            if (latestWeapon.ammo) {
                const maxLoad = Math.min(latestWeapon.ammo.capacity, latestWeapon.ammo.reload);
                const needed = Math.max(0, maxLoad - latestWeapon.ammo.rounds);
                const newRounds = Math.min(needed, latestWeapon.ammo.store);

                latestWeapon.ammo.rounds += newRounds;
                latestWeapon.ammo.store -= newRounds;
            }

            bot.$emit('playerEndReload', bot.me, latestWeapon);
        }, isEmpty ? playerActiveWeapon.longReloadTime : playerActiveWeapon.shortReloadTime);
    }
}

export default ReloadDispatch;