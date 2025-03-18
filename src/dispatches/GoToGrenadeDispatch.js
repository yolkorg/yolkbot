import AStar from '../pathing/astar.js';

export class GoToGrenadeDispatch {
    check(bot) {
        return bot.me.playing && bot.game.collectables[1].length && bot.intents.includes(bot.Intents.PATHFINDING);
    }

    execute(bot) {
        this.pather = new AStar(bot.pathing.nodeList);

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

        const position = Object.entries(bot.me.position).map(entry => Math.floor(entry[1]));
        const targetPos = Object.entries(closestGrenade).map(entry => Math.floor(entry[1]));

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

export default GoToGrenadeDispatch;