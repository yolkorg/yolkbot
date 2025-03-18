import AStar from '../pathing/astar.js';

export class GoToAmmoDispatch {
    check(bot) {
        return bot.me.playing && bot.game.collectables[0].length && bot.intents.includes(bot.Intents.PATHFINDING);
    }

    execute(bot) {
        this.pather = new AStar(bot.pathing.nodeList);

        let minDistance = 200;
        let closestAmmo = null;

        for (const ammo of bot.game.collectables[0]) {
            const dx = ammo.x - bot.me.position.x;
            const dy = ammo.y - bot.me.position.y;
            const dz = ammo.z - bot.me.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < minDistance) {
                minDistance = distance;
                closestAmmo = ammo;
            }
        }

        const position = Object.entries(bot.me.position).map(entry => Math.floor(entry[1]));
        const targetPos = Object.entries(closestAmmo).map(entry => Math.floor(entry[1]));

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

export default GoToAmmoDispatch;