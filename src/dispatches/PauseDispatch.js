import packet from '#packet';

export class PauseDispatch {
    check(bot) {
        return bot.me.playing;
    }

    execute(bot) {
        new packet.PausePacket().execute(bot.game.socket);
        setTimeout(() => bot.me.playing = false, 3000); 
    }
}

export default PauseDispatch;