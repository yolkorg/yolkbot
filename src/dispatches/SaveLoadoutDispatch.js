import { queryServices } from '#api';
import { findItemById, GunList } from '#constants';

import packet from '#packet';

const is = (variable) => typeof variable !== 'undefined';
const itemIsDefault = (itemId) => findItemById(itemId).unlock == 'default';

class SaveLoadoutDispatch {
    constructor(opts) {
        this.changes = {
            classIdx: opts.gunId,
            hatId: opts.hatId,
            stampId: opts.stampId,
            grenadeId: opts.grenadeId,
            meleeId: opts.meleeId,
            colorIdx: opts.eggColor,
            primaryId: opts.primaryIds,
            secondaryId: opts.secondaryIds
        };

        // filter out undefined
        this.changes = Object.fromEntries(Object.entries(this.changes).filter(([, v]) => v !== undefined));
    }

    check(bot) {
        if (bot.me.playing) return false;

        const load = this.changes;

        if (load.colorIdx !== undefined && load.colorIdx >= 7 && !bot.account.vip) return false; // trying to use VIP color
        if (load.colorIdx !== undefined && load.colorIdx >= 14) return false; // trying to use color that doesn't exist

        // validate that you own all of the items you're trying to use
        if (is(load.hatId) && !itemIsDefault(load.hatId) && !bot.account.ownedItemIds.includes(load.hatId)) return false;
        if (is(load.stampId) && !itemIsDefault(load.stampId) && !bot.account.ownedItemIds.includes(load.stampId)) return false;
        if (is(load.grenadeId) && !itemIsDefault(load.grenadeId) && !bot.account.ownedItemIds.includes(load.grenadeId)) return false;
        if (is(load.meleeId) && !itemIsDefault(load.meleeId) && !bot.account.ownedItemIds.includes(load.meleeId)) return false;

        // invalid classidx param
        if (is(load.classIdx) && load.classIdx > 6 || load.classIdx < 0) return false;

        // validate that you own the primary guns you're trying to use
        if (this.changes.primaryId) {
            for (let i = 0; i < 7; i++) {
                if (!itemIsDefault(this.changes.primaryId[i]) && !bot.account.ownedItemIds.includes(this.changes.primaryId[i])) {
                    return false;
                }
            }
        }

        // validate that you own the secondary guns you're trying to use
        if (this.changes.secondaryId) {
            for (let i = 0; i < 7; i++) {
                if (!itemIsDefault(this.changes.secondaryId[i]) && !bot.account.ownedItemIds.includes(this.changes.secondaryId[i])) {
                    return false;
                }
            }
        }

        // you PROBABLY own everything and we can let the packet pass
        return true;
    }

    execute(bot) {
        if (this.changes.classIdx && this.changes.classIdx !== bot.me.selectedGun) {
            bot.me.weapons[0] = new GunList[this.changes.classIdx]();
        }

        const loadout = {
            ...bot.account.loadout,
            ...this.changes
        }

        const saveLoadout = queryServices({
            cmd: 'saveLoadout',
            save: true,
            firebaseId: bot.account.firebaseId,
            sessionId: bot.account.sessionId,
            loadout
        });

        bot.account.loadout = loadout;

        saveLoadout.then((res) => {
            console.log('saveloadout returned', res);

            new packet.ChangeCharacterPacket(this.changes?.classIdx || bot.me.selectedGun).execute(bot.gameSocket);

            // apply changes to the bot
            Object.entries(this.changes).forEach(([changeKey, changeValue]) => {
                switch (changeKey) {
                    case 'classIdx':
                        bot.me.selectedGun = changeValue;
                        break;

                    case 'hatId':
                        bot.me.character.hat = findItemById(changeValue);
                        break;

                    case 'stampId':
                        bot.me.character.stamp = findItemById(changeValue);
                        break;

                    case 'grenadeId':
                        bot.me.character.grenade = findItemById(changeValue);
                        break;

                    case 'meleeId':
                        bot.me.character.melee = findItemById(changeValue);
                        break;

                    case 'colorIdx':
                        bot.me.character.eggColor = changeValue;
                        break;

                    case 'primaryId':
                        bot.me.character.primaryGun = findItemById(changeValue[bot.me.selectedGun]);
                        break;

                    case 'secondaryId':
                        bot.me.character.secondaryGun = findItemById(changeValue[bot.me.selectedGun]);
                        break;
                }
            })
        })
    }
}

export default SaveLoadoutDispatch;