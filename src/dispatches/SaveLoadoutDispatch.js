/* eslint-disable stylistic/max-len */

import { queryServices } from '#api';
import { findItemById, GunList, ItemTypes } from '#constants';

import packet from '#packet';

const isDefault = (itemId) => findItemById(itemId) && findItemById(itemId).unlock == 'default';
const isType = (itemId, type) => findItemById(itemId) && findItemById(itemId).item_type_id == type;

export class SaveLoadoutDispatch {
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
        if (isType(load.hatId, ItemTypes.Hat) && !isDefault(load.hatId) && !bot.account.ownedItemIds.includes(load.hatId)) return false;
        if (isType(load.stampId, ItemTypes.Stamp) && !isDefault(load.stampId) && !bot.account.ownedItemIds.includes(load.stampId)) return false;
        if (isType(load.grenadeId, ItemTypes.Grenade) && !isDefault(load.grenadeId) && !bot.account.ownedItemIds.includes(load.grenadeId)) return false;
        if (isType(load.meleeId, ItemTypes.Melee) && !isDefault(load.meleeId) && !bot.account.ownedItemIds.includes(load.meleeId)) return false;

        // invalid classidx param
        if (typeof load.classIdx == 'number' && load.classIdx > 6 || load.classIdx < 0) return false;

        // validate that you own the primary guns you're trying to use
        if (this.changes.primaryId) {
            for (let i = 0; i < 7; i++) {
                const testingId = this.changes.primaryId[i];

                if (!isType(testingId, ItemTypes.Primary) || (!isDefault(testingId) && !bot.account.ownedItemIds.includes(testingId))) {
                    return false;
                }
            }
        }

        // validate that you own the secondary guns you're trying to use
        if (this.changes.secondaryId) {
            for (let i = 0; i < 7; i++) {
                const testingId = this.changes.secondaryId[i];

                if (!isType(testingId, ItemTypes.Secondary) || (!isDefault(testingId) && !bot.account.ownedItemIds.includes(testingId))) {
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
        }, bot.proxy, bot.instance);

        bot.account.loadout = loadout;

        saveLoadout.then(() => {
            if (bot.state.joinedGame)
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