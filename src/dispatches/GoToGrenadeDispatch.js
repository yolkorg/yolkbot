export class GoToGrenadeDispatch {
    validate(bot) {
        return bot.intents.includes(bot.Intents.PATHFINDING);
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

        bot.pathing.activePath = bot.pathing.astar.path(myNode, targetNode);

        if (!bot.pathing.activePath) return bot.$emit('pathfindError', 'no path found');
        if (bot.pathing.activePath.length < 2) return bot.$emit('pathfindError', 'path too short');

        bot.pathing.followingPath = true;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToGrenadeDispatch;