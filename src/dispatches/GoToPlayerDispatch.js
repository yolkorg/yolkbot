import { Intents, PathfindError } from '../enums.js';

export class GoToPlayerDispatch {
    idOrName;

    constructor(idOrName) {
        this.idOrName = idOrName;
    }

    validate(bot) {
        if (!bot.intents.includes(Intents.PATHFINDING)) return false;
        if (typeof this.idOrName !== 'string' && typeof this.idOrName !== 'number') return false;

        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);
        return !!target;
    }

    check(bot) {
        if (!bot.me.playing) return false;

        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);
        return target && target.playing && target.position && target.position.x;
    }

    execute(bot) {
        const target = bot.players[this.idOrName.toString()] || bot.players.find(player => player.name === this.idOrName);

        const myNode = bot.pathing.nodeList.atObject(bot.me.position);
        const targetNode = bot.pathing.nodeList.atObject(target.position);

        const path = bot.pathing.astar.path(myNode, targetNode);

        if (!path) return bot.$emit('pathfindError', PathfindError.NoPathFound);
        if (path.length < 2) return bot.$emit('pathfindError', PathfindError.PathTooShort);

        bot.pathing.activePath = path;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToPlayerDispatch;
