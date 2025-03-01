import packet from '#packet';

export class MeleeDispatch {
    check(bot) {
        return bot.me.playing && !bot.state.reloading && !bot.state.swappingGun && !bot.state.usingMelee;
    }

    execute(bot) {
        new packet.MeleePacket().execute(bot.gameSocket);
        bot.usingMelee = true;

        // gameloop every 33.33 (repeating) ms, 17 ticks, so 566.61 is the closest you get
        setTimeout(() => {
            // new ChatDispatch('end melee, start swap gun').execute(player);
            bot.usingMelee = false
            bot.swappingGun = true

            setTimeout(() => {
                // new ChatDispatch('end swap gun').execute(player);
                bot.swappingGun = false
            }, 0.5 * bot.me.weapons[0].equipTime)
        }, 566.61);
    }
}

export default MeleeDispatch;