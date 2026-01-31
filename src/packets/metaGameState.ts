import CommIn from '../comm/CommIn.js';

import { GameMode, ZoneLeaveReason } from '../enums.js';

const processMetaGameStatePacket = (bot) => {
    if (bot.game.gameModeId === GameMode.Spatula) {
        const oldTeamScores = structuredClone(bot.game.teamScore);
        const oldSpatula = structuredClone(bot.game.spatula);

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

        bot.$emit('gameStateChange', { teamScore: { before: oldTeamScores, after: bot.game.teamScore }, spatula: { before: oldSpatula, after: bot.game.spatula } });
    } else if (bot.game.gameModeId === GameMode.KOTC) {
        const oldTeamScores = structuredClone(bot.game.teamScore);
        const oldKOTC = structuredClone(bot.game.kotc);
        const oldPlayersOnZone = Object.values(bot.players).filter((p) => p.inKotcZone && p.playing);

        bot.game.kotc.stage = CommIn.unPackInt8U(); // constants.CoopState
        bot.game.kotc.zoneIdx = CommIn.unPackInt8U(); // a number to represent which 'active zone' kotc is using
        bot.game.kotc.teamCapturing = CommIn.unPackInt8U(); // the team capturing, named "teams" in shell src
        bot.game.kotc.captureProgress = CommIn.unPackInt16U(); // progress of the coop capture
        bot.game.kotc.numCapturing = CommIn.unPackInt8U(); // number of players capturing - number/1000
        bot.game.teamScore[1] = CommIn.unPackInt8U(); // team 1 (blue) score
        bot.game.teamScore[2] = CommIn.unPackInt8U(); // team 2 (red) score

        bot.game.kotc.capturePercent = bot.game.kotc.captureProgress / 1000; // progress of the capture as a percentage
        bot.game.kotc.activeZone = bot.game.map?.zones ? bot.game.map.zones[bot.game.kotc.zoneIdx - 1] : null;

        if (bot.game.kotc.activeZone) Object.values(bot.players).forEach((player) => player.updateKotcZone(bot.game.kotc.activeZone));

        if (bot.game.kotc.numCapturing <= 0) Object.values(bot.players).forEach((player) => {
            if (player.inKotcZone) {
                player.inKotcZone = false;
                bot.$emit('playerLeaveZone', player, ZoneLeaveReason.RoundEnded);
            }
        });

        const newPlayersOnZone = Object.values(bot.players).filter((p) => p.inKotcZone && p.playing);

        bot.$emit('gameStateChange', {
            teamScore: { before: oldTeamScores, after: bot.game.teamScore },
            kotc: { before: oldKOTC, after: bot.game.kotc },
            playersOnZone: { before: oldPlayersOnZone, after: newPlayersOnZone }
        });
    } else if (bot.game.gameModeId === GameMode.Team) {
        const oldTeamScores = structuredClone(bot.game.teamScore);

        bot.game.teamScore[1] = CommIn.unPackInt16U();
        bot.game.teamScore[2] = CommIn.unPackInt16U();

        bot.$emit('gameStateChange', {
            teamScore: { before: oldTeamScores, after: bot.game.teamScore }
        });
    }

    if (bot.game.gameModeId !== GameMode.Spatula) delete bot.game.spatula;
    if (bot.game.gameModeId !== GameMode.KOTC) delete bot.game.kotc;
    if (bot.game.gameModeId === GameMode.FFA) delete bot.game.teamScore;
}

export default processMetaGameStatePacket;