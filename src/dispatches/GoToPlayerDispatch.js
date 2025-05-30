import AStar from '../pathing/astar.js';

export class GoToPlayerDispatch {
    idOrName;

    constructor(idOrName) {
        this.idOrName = idOrName;
    }

    validate(bot) {
        if (!bot.intents.includes(bot.Intents.PATHFINDING)) return false;
        if (!this.idOrName) return false;

        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);
        return !!target;
    }

    check(bot) {
        if (!bot.me.playing) return false;

        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);
        return target && target.playing && target.position && target.position.x;
    }

    execute(bot) {
        this.pather = new AStar(bot.pathing.nodeList);

        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);

        const position = Object.entries(bot.me.position).map(entry => Math.floor(entry[1]));
        const targetPos = Object.entries(target.position).map(entry => Math.floor(entry[1]));

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
