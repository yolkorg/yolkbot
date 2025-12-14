import { Intents, PathfindError } from '../enums.js';

export class GoToGrenadeDispatch {
    validate(bot) {
        return bot.intents.includes(Intents.PATHFINDING);
    }

    check(bot) {
        return bot.me.playing && bot.game.collectables[1].length;
    }

    execute(bot) {
        let minDistance = 200;
        let closestGrenade = null;

        for (const grenade of bot.game.collectables[1]) {
            const dx = grenade.x - bot.me.position.x;
            const dy = grenade.y - bot.me.position.y;
            const dz = grenade.z - bot.me.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < minDistance) {
                minDistance = distance;
                closestGrenade = grenade;
            }
        }

        const myNode = bot.pathing.nodeList.atObject(bot.me.position);
        const targetNode = bot.pathing.nodeList.atObject(closestGrenade);

        const path = bot.pathing.astar.path(myNode, targetNode);

        if (!path) return bot.$emit('pathfindError', PathfindError.NoPathFound);
        if (path.length < 2) return bot.$emit('pathfindError', PathfindError.PathTooShort);

        bot.pathing.activePath = path;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToGrenadeDispatch;