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
        const myNode = bot.pathing.nodeList.atObject(bot.me.position);
        const targetNode = bot.pathing.nodeList.atObject(bot.game.spatula.coords);

        bot.pathing.activePath = bot.pathing.astar.path(myNode, targetNode);

        if (!bot.pathing.activePath) return bot.$emit('pathfindError', 'no path found');
        if (bot.pathing.activePath.length < 2) return bot.$emit('pathfindError', 'path too short');

        bot.pathing.followingPath = true;
        bot.pathing.activeNode = bot.pathing.activePath[1];
        bot.pathing.activeNodeIdx = 1;
    }
}

export default GoToSpatulaDispatch;
