import AStar from '../pathing/astar.js';

export class GoToSpatulaDispatch {
    validate(bot) {
        return bot.intents.includes(bot.Intents.PATHFINDING);
    }

    check(bot) {
        return bot.me.playing &&
            bot.game.spatula &&
            bot.game.spatula.coords &&
            bot.game.spatula.coords.x;
    }

    execute(bot) {
        this.pather = new AStar(bot.pathing.nodeList);

        const position = Object.entries(bot.me.position).map(entry => Math.floor(entry[1]));
        const targetPos = Object.entries(bot.game.spatula.coords).map(entry => Math.floor(entry[1]));

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

export default GoToSpatulaDispatch;
