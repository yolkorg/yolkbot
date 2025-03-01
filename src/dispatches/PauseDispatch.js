import packet from '#packet';

export class PauseDispatch {
    check(bot) {
        return bot.me.playing;
    }

    execute(bot) {
        new packet.PausePacket().execute(bot.gameSocket);
        setTimeout(() => bot.me.playing = false, 3000); 
    }
}

export default PauseDispatch;