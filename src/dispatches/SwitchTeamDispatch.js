import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

export class SwitchTeamDispatch {
    validate() {
        return true;
    }

    check(bot) {
        if (!bot.state.inGame || bot.me.playing) return false; // you probably cant change team mid-game
        if (bot.game.gameModeId === 0) return false; // ffa
        if (bot.intents.includes(bot.Intents.OBSERVE_GAME)) return false;

        // hosts can disable team switching in private games
        if (bot.game.isPrivate) return !bot.game.options.noTeamChange;

        const players = bot.players;
        const myTeam = bot.me.team;

        const playersWithMyTeam = players.filter(player => player.team === myTeam).length;
        const playersWithOtherTeam = players.filter(player => player.team !== myTeam).length;

        if (playersWithOtherTeam > playersWithMyTeam) return false;
        if (playersWithMyTeam === playersWithOtherTeam) return false;

        return true;
    }

    execute(bot) {
        const out = new CommOut();
        out.packInt8(CommCode.switchTeam);
        out.send(bot.game.socket);
    }
}

export default SwitchTeamDispatch;