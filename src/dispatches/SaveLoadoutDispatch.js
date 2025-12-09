import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import { findItemById, GunList, ItemType } from '../constants/index.js';
import { createGun } from '../util.js';

import { Intents } from '../enums.js';

const isDefault = (itemId) => findItemById(itemId) && findItemById(itemId).unlock === 'default';
const isType = (itemId, type) => findItemById(itemId) && findItemById(itemId).item_type_id === type;

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
        this.changes = Object.fromEntries(Object.entries(this.changes).filter(([, v]) => !!v));
    }

    validate(bot) {
        const load = this.changes;

        if (load.colorIdx && load.colorIdx >= 7 && !bot.account.vip) return false; // trying to use VIP color
        if (load.colorIdx && load.colorIdx >= 14) return false; // trying to use color that doesn't exist

        // validate that you own all of the items you're trying to use
        if (isType(load.hatId, ItemType.Hat) && !isDefault(load.hatId) && !bot.account.ownedItemIds.includes(load.hatId)) return false;
        if (isType(load.stampId, ItemType.Stamp) && !isDefault(load.stampId) && !bot.account.ownedItemIds.includes(load.stampId)) return false;
        if (isType(load.grenadeId, ItemType.Grenade) && !isDefault(load.grenadeId) && !bot.account.ownedItemIds.includes(load.grenadeId)) return false;
        if (isType(load.meleeId, ItemType.Melee) && !isDefault(load.meleeId) && !bot.account.ownedItemIds.includes(load.meleeId)) return false;

        // invalid classidx param
        if (typeof load.classIdx === 'number' && load.classIdx > 6 || load.classIdx < 0) return false;

        // validate that you own the primary guns you're trying to use
        if (this.changes.primaryId) {
            for (let i = 0; i < 7; i++) {
                const testingId = this.changes.primaryId[i];

                if (!isType(testingId, ItemType.Primary) || (!isDefault(testingId) && !bot.account.ownedItemIds.includes(testingId))) {
                    return false;
                }
            }
        }

        // validate that you own the secondary guns you're trying to use
        if (this.changes.secondaryId) {
            for (let i = 0; i < 7; i++) {
                const testingId = this.changes.secondaryId[i];

                if (!isType(testingId, ItemType.Secondary) || (!isDefault(testingId) && !bot.account.ownedItemIds.includes(testingId))) {
                    return false;
                }
            }
        }

        // you PROBABLY own everything and we can let the packet pass
        return true;
    }

    check(bot) {
        return !bot.me.playing;
    }

    execute(bot) {
        if (bot.me && this.changes.classIdx && this.changes.classIdx !== bot.me.selectedGun)
            bot.me.weapons[0] = createGun(GunList[this.changes.classIdx]);

        bot.state.weaponIdx = this.changes.classIdx || bot.state.weaponIdx;

        const loadout = {
            ...bot.account.loadout,
            ...this.changes
        }

        const saveLoadout = bot.api.queryServices({
            cmd: 'saveLoadout',
            save: true,
            firebaseId: bot.account.firebaseId,
            sessionId: bot.account.sessionId,
            loadout
        });

        bot.account.loadout = loadout;

        if (bot.me) saveLoadout.then(() => {
            if (bot.state.inGame) {
                const out = new CommOut();
                out.packInt8(CommCode.changeCharacter);
                out.packInt8(this.changes?.classIdx || bot.me.selectedGun);
                out.send(bot.game.socket);
            }

            const findCosmetics = bot.intents.includes(Intents.COSMETIC_DATA);

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