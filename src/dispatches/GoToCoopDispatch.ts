import { Intents, PathfindError } from '../enums.js';

export class GoToCoopDispatch {
    validate(bot: Bot): boolean {
        return bot.intents.includes(Intents.PATHFINDING);
    }

    check(bot: Bot): boolean {
        return bot.me.playing && bot.game.kotc.zoneIdx && bot.game.kotc.activeZone;
    }

    execute(bot: Bot): void {
        let minDistance = 20000;
        let closestZone = null;

        for (const zoneCoords of bot.game.kotc.activeZone) {
            const dx = zoneCoords.x - bot.me.position.x;
            const dy = zoneCoords.y - bot.me.position.y;
            const dz = zoneCoords.z - bot.me.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < minDistance) {
                minDistance = distance;
                closestZone = zoneCoords;
            }
        }

        if (!closestZone) return;

        const myNode = bot.pathing.nodeList.atObject(bot.me.position);
        const targetNode = bot.pathing.nodeList.atObject(closestZone);

        const path = bot.pathing.astar.path(myNode, targetNode);

        if (!path) return bot.$emit('pathfindError', PathfindError.NoPathFound);
        if (path.length < 2) return bot.$emit('pathfindError', PathfindError.PathTooShort);

        bot.pathing.activePath = path;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToCoopDispatch;