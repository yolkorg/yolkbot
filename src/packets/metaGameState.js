import CommIn from '../comm/CommIn.js';

import { GameMode } from '../constants/index.js';
import { ZoneLeaveReason } from '../enums.js';

const processMetaGameStatePacket = (bot) => {
    if (bot.game.gameModeId === GameMode.Spatula) {
        const oldGame = structuredClone(bot.game);

        bot.game.teamScore[1] = CommIn.unPackInt16U();
        bot.game.teamScore[2] = CommIn.unPackInt16U();

        const spatulaCoords = {
            x: CommIn.unPackFloat(),
            y: CommIn.unPackFloat(),
            z: CommIn.unPackFloat()
        };

        const controlledBy = CommIn.unPackInt8U();
        const controlledByTeam = CommIn.unPackInt8U();

        bot.game.spatula = { coords: spatulaCoords, controlledBy, controlledByTeam };

        bot.$emit('gameStateChange', oldGame, bot.game);
    } else if (bot.game.gameModeId === GameMode.KOTC) {
        const oldGame = structuredClone(bot.game);

        bot.game.stage = CommIn.unPackInt8U(); // constants.CoopState
        bot.game.zoneNumber = CommIn.unPackInt8U(); // a number to represent which 'active zone' kotc is using
        bot.game.capturing = CommIn.unPackInt8U(); // the team capturing, named "teams" in shell src
        bot.game.captureProgress = CommIn.unPackInt16U(); // progress of the coop capture
        bot.game.numCapturing = CommIn.unPackInt8U(); // number of players capturing - number/1000
        bot.game.teamScore[1] = CommIn.unPackInt8U(); // team 1 (blue) score
        bot.game.teamScore[2] = CommIn.unPackInt8U(); // team 2 (red) score

        bot.game.capturePercent = bot.game.captureProgress / 1000; // progress of the capture as a percentage
        bot.game.activeZone = bot.game.map.zones ? bot.game.map.zones[bot.game.zoneNumber - 1] : null;

        const oldPlayersOnZone = Object.values(bot.players).filter((p) => p.inKotcZone && p.playing);

        if (bot.game.activeZone) Object.values(bot.players).forEach((player) => player.updateKotcZone(bot.game.activeZone));

        if (bot.game.numCapturing <= 0) Object.values(bot.players).forEach((player) => {
            if (player.inKotcZone) {
                player.inKotcZone = false;
                bot.$emit('playerLeaveZone', player, ZoneLeaveReason.RoundEnded);
            }
        });

        bot.$emit('gameStateChange', oldGame, bot.game, oldPlayersOnZone);
    } else if (bot.game.gameModeId === GameMode.Team) {
        bot.game.teamScore[1] = CommIn.unPackInt16U();
        bot.game.teamScore[2] = CommIn.unPackInt16U();
    }

    if (bot.game.gameModeId !== GameMode.Spatula) delete bot.game.spatula;

    if (bot.game.gameModeId !== GameMode.KOTC) {
        delete bot.game.stage;
        delete bot.game.zoneNumber;
        delete bot.game.capturing;
        delete bot.game.captureProgress;
        delete bot.game.numCapturing;
        delete bot.game.numCapturing;
        delete bot.game.activeZone;
    }

    if (bot.game.gameModeId === GameMode.FFA) delete bot.game.teamScore;
}

export default processMetaGameStatePacket;