import CommIn from '../comm/CommIn.js';

const processSwitchTeamPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const toTeam = CommIn.unPackInt8U();

    const player = bot.players[id];
    if (!player) return;

    const oldTeam = player.team;

    player.team = toTeam;
    player.streak = 0;

    bot.$emit('playerSwitchTeam', player, oldTeam, toTeam);
}

export default processSwitchTeamPacket;