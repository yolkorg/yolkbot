import GamePlayer from '../bot/GamePlayer.js';
import CommIn from '../comm/CommIn.js';

import { findItemById } from '../constants/findItemById.js';

import { GameMode } from '../constants/index.js';
import { Intents } from '../enums.js';

const processAddPlayerPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const findCosmetics = bot.intents.includes(Intents.COSMETIC_DATA);

    const playerData = {
        id,
        uniqueId: CommIn.unPackString(),
        name: CommIn.unPackString(),
        safeName: CommIn.unPackString(),
        charClass: CommIn.unPackInt8U(),
        team: CommIn.unPackInt8U(),
        primaryWeaponItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
        secondaryWeaponItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
        shellColor: CommIn.unPackInt8U(),
        hatItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
        stampItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
        stampPosX: CommIn.unPackInt8(),
        stampPosY: CommIn.unPackInt8(),
        grenadeItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
        meleeItem: findCosmetics ? findItemById(CommIn.unPackInt16U()) : CommIn.unPackInt16U(),
        x: CommIn.unPackFloat(),
        y: CommIn.unPackFloat(),
        z: CommIn.unPackFloat(),
        $dx: CommIn.unPackFloat(),
        $dy: CommIn.unPackFloat(),
        $dz: CommIn.unPackFloat(),
        yaw: CommIn.unPackRadU(),
        pitch: CommIn.unPackRad(),
        score: CommIn.unPackInt32U(),
        // the following are all stats
        $kills: CommIn.unPackInt16U(),
        $deaths: CommIn.unPackInt16U(),
        $streak: CommIn.unPackInt16U(),
        totalKills: CommIn.unPackInt32U(),
        totalDeaths: CommIn.unPackInt32U(),
        bestStreak: CommIn.unPackInt16U(),
        $bestOverallStreak: CommIn.unPackInt16U(),
        // end stats
        shield: CommIn.unPackInt8U(),
        hp: CommIn.unPackInt8U(),
        playing: CommIn.unPackInt8U(),
        weaponIdx: CommIn.unPackInt8U(),
        $controlKeys: CommIn.unPackInt8U(),
        upgradeProductId: CommIn.unPackInt8U(),
        activeShellStreaks: CommIn.unPackInt8U(),
        social: CommIn.unPackLongString(),
        hideBadge: CommIn.unPackInt8U()
    };

    bot.game.mapIdx = CommIn.unPackInt8U();
    bot.game.isPrivate = CommIn.unPackInt8U() === 1;
    bot.game.gameModeId = CommIn.unPackInt8U();

    const player = new GamePlayer(playerData, bot.game.gameMode === GameMode.KOTC ? bot.game.activeZone : null);
    if (!bot.players[playerData.id]) bot.players[playerData.id] = player;

    bot.$emit('playerJoin', player);

    if (bot.me.id === playerData.id) {
        bot.me = player;
        bot.$emit('botJoin', bot.me);
    }
};

export default processAddPlayerPacket;