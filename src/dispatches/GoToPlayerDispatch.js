import { Intents, PathfindError } from '../enums.js';

export class GoToPlayerDispatch {
    idOrName;

    constructor(idOrName) {
        this.idOrName = idOrName;
    }

    $grabPlayer(bot) {
        return bot.players[this.idOrName.toString()] || Object.values(bot.players).find(player => player.name === this.idOrName);
    }

    validate(bot) {
        return bot.intents.includes(Intents.PATHFINDING) &&
            (typeof this.idOrName === 'string' || typeof this.idOrName === 'number');
    }

    check(bot) {
        if (!bot.me.playing) return false;

        const target = this.$grabPlayer(bot);
        return target && target.playing && target.position && Number.isFinite(target.position.x);
    }

    execute(bot) {
        const target = this.$grabPlayer(bot);

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
