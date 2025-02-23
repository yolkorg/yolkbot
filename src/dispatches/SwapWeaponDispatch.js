import packet from '#packet';

class SwapWeaponDispatch {
    check(bot) {
        return bot.me.playing && !bot.state.reloading && !bot.state.swappingGun && !bot.state.usingMelee;
    }

    execute(bot) {
        bot.me.activeGun = +!bot.me.activeGun;
        new packet.SwapWeaponPacket(bot.me.activeGun).execute(bot.gameSocket);
    }
}

export default SwapWeaponDispatch;