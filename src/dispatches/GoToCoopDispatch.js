export class GoToCoopDispatch {
    validate(bot) {
        return bot.intents.includes(bot.Intents.PATHFINDING);
    }

    check(bot) {
        return bot.me.playing && bot.game.zoneNumber && bot.game.activeZone;
    }

    execute(bot) {
        let minDistance = 200;
        let closestZone = null;

        for (const zone of bot.game.activeZone) {
            const dx = zone.x - bot.me.position.x;
            const dy = zone.y - bot.me.position.y;
            const dz = zone.z - bot.me.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < minDistance) {
                minDistance = distance;
                closestZone = zone;
            }
        }

        const myNode = bot.pathing.nodeList.atObject(bot.me.position);
        const targetNode = bot.pathing.nodeList.atObject(closestZone);

        bot.pathing.activePath = bot.pathing.astar.path(myNode, targetNode);

        if (!bot.pathing.activePath) return bot.$emit('pathfindError', 'no path found');
        if (bot.pathing.activePath.length < 2) return bot.$emit('pathfindError', 'path too short');

        bot.pathing.followingPath = true;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToCoopDispatch;