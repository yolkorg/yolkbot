import Bot from '../bot';
import GamePlayer from '../bot/GamePlayer';

export declare class GoToPlayerDispatch {
    constructor(target: GamePlayer);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GoToPlayerDispatch;