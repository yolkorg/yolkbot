import { queryServices } from '#api';
import packet from '#packet';

class SaveLoadoutDispatch {
    constructor(gunId) {
        this.gunId = gunId;
    }

    check(bot) {
        return !bot.me.playing;
    }

    execute(bot) {
        new packet.ChangeCharacterPacket(this.gunId || bot.me.selectedGun).execute(bot.gameSocket);

        const saveLoadout = queryServices({
            cmd: 'saveLoadout',
            save: true,
            firebaseId: bot.loginData.firebaseId,
            sessionId: bot.loginData.sessionId,
            loadout: {
                classIdx: this.gunId || bot.me.selectedGun,
                hatId: bot.me.character.hat?.id || null,
                stampId: bot.me.character.stamp?.id || null,
                stampPositionX: 0,
                stampPositionY: 0,
                grenadeId: bot.me.character.grenade.id,
                meleeId: bot.me.character.melee.id,
                colorIdx: bot.me.character.eggColor,
                primaryId: [
                    3100,
                    3600,
                    3400,
                    3800,
                    4000,
                    4200,
                    4500
                ],
                secondaryId: new Array(7).fill(3000)
            }
        })

        saveLoadout.then((res) => console.log('saveloadout', res)) 
    }
}

export default SaveLoadoutDispatch;