import CommIn from '../comm/CommIn.js';

import { createGun } from '../util.js';

import { GunList } from '../constants/guns.js';
import { findItemById } from '../constants/findItemById.js';

import { Intents } from '../enums.js';

const processChangeCharacterPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const weaponIndex = CommIn.unPackInt8U();

    const primaryWeaponIdx = CommIn.unPackInt16U();
    const secondaryWeaponIdx = CommIn.unPackInt16U();
    const shellColor = CommIn.unPackInt8U();
    const hatIdx = CommIn.unPackInt16U();
    const stampIdx = CommIn.unPackInt16U();
    const grenadeIdx = CommIn.unPackInt16U();
    const meleeIdx = CommIn.unPackInt16U();

    const stampPositionX = CommIn.unPackInt8();
    const stampPositionY = CommIn.unPackInt8();

    const findCosmetics = bot.intents.includes(Intents.COSMETIC_DATA);

    const primaryWeaponItem = findCosmetics ? findItemById(primaryWeaponIdx) : primaryWeaponIdx;
    const secondaryWeaponItem = findCosmetics ? findItemById(secondaryWeaponIdx) : secondaryWeaponIdx;
    const hatItem = findCosmetics ? findItemById(hatIdx) : hatIdx;
    const stampItem = findCosmetics ? findItemById(stampIdx) : stampIdx;
    const grenadeItem = findCosmetics ? findItemById(grenadeIdx) : grenadeIdx;
    const meleeItem = findCosmetics ? findItemById(meleeIdx) : meleeIdx;

    const player = bot.players[id];
    if (player) {
        const oldCharacter = structuredClone(player.character);
        const oldWeaponIdx = player.selectedGun;

        player.character.eggColor = shellColor;
        player.character.primaryGun = primaryWeaponItem;
        player.character.secondaryGun = secondaryWeaponItem;
        player.character.stamp = stampItem;
        player.character.hat = hatItem;
        player.character.grenade = grenadeItem;
        player.character.melee = meleeItem;

        player.character.stampPos.x = stampPositionX;
        player.character.stampPos.y = stampPositionY;

        player.selectedGun = weaponIndex;
        player.weapons[0] = createGun(GunList[weaponIndex]);

        if (oldWeaponIdx !== player.selectedGun) bot.$emit('playerChangeGun', player, oldWeaponIdx, player.selectedGun);
        if (JSON.stringify(oldCharacter) !== JSON.stringify(player.character)) bot.$emit('playerChangeCharacter', player, oldCharacter, player.character);
    }
}

export default processChangeCharacterPacket;