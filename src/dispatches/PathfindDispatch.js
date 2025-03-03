import AStar from '../pathing/astar.js';

export class PathfindDispatch {
    constructor(target) {
        this.target = target;
    }

    check() {
        return true;
    }

    execute(bot) {
        this.pather = new AStar(bot.pathing.nodeList);

        const position = Object.entries(bot.me.position).map(entry => Math.floor(entry[1]));
        const targetPos = Object.entries(this.target.position).map(entry => Math.floor(entry[1]));

        const myNode = bot.pathing.nodeList.at(...position);
        const targetNode = bot.pathing.nodeList.at(...targetPos);

        // console.log('myNode:', !!myNode, 'target:', !!targetNode, 'pathing from my position at', position, 'to', targetPos);

        bot.pathing.activePath = this.pather.path(myNode, targetNode);
        if (!bot.pathing.activePath) {
            console.log('no path found');
            return;
        }
        if (bot.pathing.activePath.length < 2) {
            console.log('path too short');
            return;
        }
        bot.pathing.followingPath = true;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default PathfindDispatch;
