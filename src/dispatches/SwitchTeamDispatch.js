import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

export class SwitchTeamDispatch {
    check(bot) {
        if (!bot.state.joinedGame || bot.me.playing) return false; // you probably cant change team mid-game
        if (bot.game.gameModeId === 0) return false; // ffa

        if (bot.game.isPrivate) {
            // hosts can disable team switching in private games
            if (bot.game.options.noTeamChange) return false;
            else return true;
        }

        const players = bot.players;
        const myTeam = bot.me.team;

        const playersWithMyTeam = players.filter(player => player.team === myTeam).length;
        const playersWithOtherTeam = players.filter(player => player.team !== myTeam).length;

        if (playersWithOtherTeam > playersWithMyTeam) return false;
        if (playersWithMyTeam === playersWithOtherTeam) return false;

        return true;
    }

    execute(bot) {
        const out = CommOut.getBuffer();
        out.packInt8(CommCode.switchTeam);
        out.send(bot.game.socket);
    }
}

export default SwitchTeamDispatch;