import CommIn from '../comm/CommIn.js';

import { CoopState, GameAction, GameMode } from '../constants/index.js';

const processGameActionPacket = (bot) => {
    const action = CommIn.unPackInt8U();

    if (action === GameAction.Pause) {
        bot.$emit('gameForcePause');
        setTimeout(() => bot.me.playing = false, 3000);
    }

    if (action === GameAction.Reset) {
        Object.values(bot.players).forEach((player) => player.streak = 0);

        if (bot.game.gameModeId !== GameMode.FFA) bot.game.teamScore = [0, 0, 0];

        if (bot.game.gameModeId === GameMode.Spatula) {
            bot.game.spatula.controlledBy = 0;
            bot.game.spatula.controlledByTeam = 0;
            bot.game.spatula.coords = { x: 0, y: 0, z: 0 };
        }

        if (bot.game.gameModeId === GameMode.KOTC) {
            bot.game.kotc.stage = CoopState.Capturing;
            bot.game.kotc.zoneNumber = 0;
            bot.game.kotc.activeZone = null;
            bot.game.kotc.capturing = 0;
            bot.game.kotc.captureProgress = 0;
            bot.game.kotc.numCapturing = 0;
            bot.game.kotc.capturePercent = 0.0;
        }

        bot.$emit('gameReset');
    }
}

export default processGameActionPacket;