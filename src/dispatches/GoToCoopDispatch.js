import AStar from '../pathing/astar.js';

export class GoToCoopDispatch {
    check(bot) {
        return bot.me.playing && bot.game.zoneNumber && bot.game.activeZone && bot.intents.includes(bot.Intents.PATHFINDING);
    }

    execute(bot) {
        this.pather = new AStar(bot.pathing.nodeList);

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

        const position = Object.entries(bot.me.position).map(entry => Math.floor(entry[1]));
        const targetPos = Object.entries(closestZone).map(entry => Math.floor(entry[1]));

        const myNode = bot.pathing.nodeList.at(...position);
        const targetNode = bot.pathing.nodeList.at(...targetPos);

        bot.pathing.activePath = this.pather.path(myNode, targetNode);

        if (!bot.pathing.activePath) return console.error('no path found');
        if (bot.pathing.activePath.length < 2) return console.error('path too short');

        bot.pathing.followingPath = true;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToCoopDispatch;