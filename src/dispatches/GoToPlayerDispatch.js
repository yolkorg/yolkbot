import AStar from '../pathing/astar.js';

export class GoToPlayerDispatch {
    constructor(target) {
        this.target = target;
    }

    check(bot) {
        return bot.me.playing &&
            this.target &&
            this.target.playing &&
            this.target.position &&
            bot.intents.includes(bot.Intents.PATHFINDING);
    }

    execute(bot) {
        this.pather = new AStar(bot.pathing.nodeList);

        const position = Object.entries(bot.me.position).map(entry => Math.floor(entry[1]));
        const targetPos = Object.entries(this.target.position).map(entry => Math.floor(entry[1]));

        const myNode = bot.pathing.nodeList.at(...position);
        const targetNode = bot.pathing.nodeList.at(...targetPos);

        bot.pathing.activePath = this.pather.path(myNode, targetNode);

        if (!bot.pathing.activePath) return bot.processError('no path found');
        if (bot.pathing.activePath.length < 2) return bot.processError('path too short');

        bot.pathing.followingPath = true;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToPlayerDispatch;
