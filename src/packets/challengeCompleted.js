import CommIn from '../comm/CommIn.js';

import { Intents } from '../enums.js';

const processChallengeCompletedPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const challengeId = CommIn.unPackInt8U();

    const player = bot.players[id];
    if (!player) return;

    if (!bot.intents.includes(Intents.CHALLENGES))
        return bot.$emit('challengeComplete', player, challengeId);

    const challenge = bot.account.challenges.find(c => c.id === challengeId);
    bot.$emit('challengeComplete', player, challenge);

    if (player.id === bot.me.id) bot.refreshChallenges();
}

export default processChallengeCompletedPacket;