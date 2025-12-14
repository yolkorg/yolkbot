import { Intents, PathfindError } from '../enums.js';

export class GoToSpatulaDispatch {
    validate(bot) {
        return bot.intents.includes(Intents.PATHFINDING);
    }

    check(bot) {
        return bot.me.playing &&
            bot.game.spatula &&
            bot.game.spatula.coords &&
            bot.game.spatula.coords.x;
    }

    execute(bot) {
        const myNode = bot.pathing.nodeList.atObject(bot.me.position);
        const targetNode = bot.pathing.nodeList.atObject(bot.game.spatula.coords);

        const path = bot.pathing.astar.path(myNode, targetNode);

        if (!path) return bot.$emit('pathfindError', PathfindError.NoPathFound);
        if (path.length < 2) return bot.$emit('pathfindError', PathfindError.PathTooShort);

        bot.pathing.activePath = path;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToSpatulaDispatch;
