/* eslint-disable stylistic/max-len */

import { queryServices } from '../api.js';
import { findItemById, GunList, ItemTypes } from '../constants/index.js';

import CommOut from '../comm/CommOut.js';
import { CommCode } from '../constants/codes.js';

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
            if (bot.state.joinedGame) {
                const out = CommOut.getBuffer();
                out.packInt8(CommCode.changeCharacter);
                out.packInt8(this.changes?.classIdx || bot.me.selectedGun);
                out.send(bot.game.socket);
            }

            const findCosmetics = bot.intents.includes(bot.Intents.COSMETIC_DATA);

            // apply changes to the bot
            Object.entries(this.changes).forEach(([changeKey, changeValue]) => {
                if (changeKey === 'classIdx') bot.me.selectedGun = changeValue;
                else if (changeKey === 'hatId') bot.me.character.hat = findCosmetics ? findItemById(changeValue) : changeValue;
                else if (changeKey === 'stampId') bot.me.character.stamp = findCosmetics ? findItemById(changeValue) : changeValue;
                else if (changeKey === 'grenadeId') bot.me.character.grenade = findCosmetics ? findItemById(changeValue) : changeValue;
                else if (changeKey === 'meleeId') bot.me.character.melee = findCosmetics ? findItemById(changeValue) : changeValue;
                else if (changeKey === 'colorIdx') bot.me.character.eggColor = changeValue;
                else if (changeKey === 'primaryId') bot.me.character.primaryGun = findCosmetics ? findItemById(changeValue[bot.me.selectedGun]) : changeValue;
                else if (changeKey === 'secondaryId') bot.me.character.secondaryGun = findCosmetics ? findItemById(changeValue[bot.me.selectedGun]) : changeValue;
            })
        })
    }
}

export default SaveLoadoutDispatch;