import CommIn from '../comm/CommIn.js';

const processUpdateBalancePacket = (bot) => {
    const newBalance = CommIn.unPackInt32U();
    const oldBalance = bot.account.eggBalance;

    bot.account.eggBalance = newBalance;
    bot.$emit('balanceUpdate', oldBalance, newBalance);
}

export default processUpdateBalancePacket;