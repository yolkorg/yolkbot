import Bot from '../bot/bot.js';

import { Intents, PathfindError } from '../enums.js';

export class GoToAmmoDispatch {
    validate(bot: Bot): boolean {
        return bot.intents.includes(Intents.PATHFINDING);
    }

    check(bot: Bot): boolean {
        return bot.me.playing && bot.game.collectibles[0].length > 0;
    }

    execute(bot: Bot): void {
        let minDistance = 2000;
        let closestAmmo = null;

        for (const ammo of bot.game.collectibles[0]) {
            const dx = ammo.x - bot.me.position.x;
            const dy = ammo.y - bot.me.position.y;
            const dz = ammo.z - bot.me.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < minDistance) {
                minDistance = distance;
                closestAmmo = ammo;
            }
        }

        if (!closestAmmo) return;

        const myNode = bot.pathing.nodeList.atObject(bot.me.position);
        const targetNode = bot.pathing.nodeList.atObject(closestAmmo);

        const path = bot.pathing.astar.path(myNode, targetNode);

        if (!path) return bot.$emit('pathfindError', PathfindError.NoPathFound);
        if (path.length < 2) return bot.$emit('pathfindError', PathfindError.PathTooShort);

        bot.pathing.activePath = path;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToAmmoDispatch;