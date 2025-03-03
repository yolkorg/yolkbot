import packet from '#packet';

const regenScale = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4];

export class GameOptionsDispatch {
    check(bot) {
        if (!bot.game.isGameOwner) return false;

        if (![0.25, 0.5, 0.75, 1].includes(bot.game.options.gravity)) return false;
        if (![0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].includes(bot.game.options.damage)) return false;
        if (!regenScale.includes(bot.game.options.healthRegen)) return false;
        if (typeof bot.game.options.locked !== 'boolean') return false;
        if (typeof bot.game.options.noTeamChange !== 'boolean') return false;
        if (typeof bot.game.options.noTeamShuffle !== 'boolean') return false;

        if (!Array.isArray(bot.game.options.weaponsDisabled)) return false;
        if (bot.game.options.weaponsDisabled.length !== 7) return false;
        if (bot.game.options.weaponsDisabled.some((weapon) => typeof weapon !== 'boolean')) return false;

        return true;
    }

    execute(bot) {
        new packet.GameOptionsPacket(bot.game.options).execute(bot.gameSocket);
    }
}

export default GameOptionsDispatch;