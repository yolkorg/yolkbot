import Bot from '../bot';
import { Position } from '../bot/GamePlayer';

export type Params = [pos: Position];

export declare class LookAtPosDispatch {
    pos: Position;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default LookAtPosDispatch;