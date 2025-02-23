import packet from '#packet';

class GameOptionsDispatch {
    check(bot) {
        return bot.game.isGameOwner;
    }

    execute(bot) {
        new packet.GameOptionsPacket(bot.game.options).execute(bot.gameSocket);
    }
}

export default GameOptionsDispatch;