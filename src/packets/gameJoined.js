import CommIn from '../comm/CommIn.js';
import CommOut from '../comm/CommOut.js';
import CommCode from '../constants/CommCode.js';

import AStar from '../pathing/astar.js';
import { NodeList } from '../pathing/mapnode.js';

import { fetchMap, initKotcZones } from '../util.js';

import { GameMode } from '../constants/index.js';
import { Intents } from '../enums.js';
import { Maps } from '../constants/maps.js';

const GameModeById = Object.fromEntries(Object.entries(GameMode).map(([key, value]) => [value, key]));

const processGameJoinedPacket = async (bot) => {
    bot.me.id = CommIn.unPackInt8U();
    bot.me.team = CommIn.unPackInt8U();
    bot.game.gameModeId = CommIn.unPackInt8U(); // aka gameType
    bot.game.gameMode = GameModeById[bot.game.gameModeId];
    bot.game.mapIdx = CommIn.unPackInt8U();
    bot.game.map = Maps[bot.game.mapIdx];

    bot.game.playerLimit = CommIn.unPackInt8U();
    bot.game.isGameOwner = CommIn.unPackInt8U() === 1;
    bot.game.isPrivate = CommIn.unPackInt8U() === 1 || bot.game.isGameOwner;

    CommIn.unPackInt8U(); // abTestBucket, unused

    if (bot.intents.includes(Intents.LOAD_MAP) || bot.intents.includes(Intents.PATHFINDING)) {
        const map = await fetchMap(bot.game.map.filename, bot.game.map.hash);
        if (bot.game.map) bot.game.map.raw = map;

        if (bot.game.gameModeId === GameMode.KOTC) {
            const meshData = bot.game.map.raw.data['DYNAMIC.capture-zone.none'];
            if (meshData) {
                bot.game.map.zones = initKotcZones(meshData);
                if (!bot.game.kotc.activeZone) bot.game.kotc.activeZone = bot.game.map.zones[bot.game.kotc.zoneIdx - 1];
            } else delete bot.game.map.zones;
        }

        if (bot.intents.includes(Intents.PATHFINDING)) {
            bot.pathing.nodeList = new NodeList(bot.game.map.raw);
            bot.pathing.astar = new AStar(bot.pathing.nodeList);
        }

        bot.$emit('mapLoad', bot.game.map.raw);
    }

    bot.state.inGame = true;
    bot.lastDeathTime = Date.now();

    const out = new CommOut();
    out.packInt8(CommCode.clientReady);
    out.send(bot.game.socket);

    if (!bot.intents.includes(Intents.MANUAL_UPDATE))
        bot.updateIntervalId = setInterval(() => bot.update(), 100 / 3);

    if (bot.intents.includes(Intents.PING)) {
        bot.lastPingTime = Date.now();

        const out2 = new CommOut();
        out2.packInt8(CommCode.ping);
        out2.send(bot.game.socket);
    }

    if (bot.intents.includes(Intents.NO_AFK_KICK)) bot.afkKickInterval = setInterval(() => {
        if (bot.state.inGame && !bot.me.playing && (Date.now() - bot.lastDeathTime) >= 15000) {
            const out3 = new CommOut();
            out3.packInt8(CommCode.keepAlive);
            out3.send(bot.game.socket);
        }
    }, 15000);

    bot.$emit('gameReady');
}

export default processGameJoinedPacket;