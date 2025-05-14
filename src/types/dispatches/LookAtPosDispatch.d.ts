import Bot from '../bot';
import { Position } from '../bot/GamePlayer';

export declare class LookAtPosDispatch {
    pos: Position;

    constructor(pos: Position);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default LookAtPosDispatch;