import Bot from '../bot';

type Position = {
    x: number;
    y: number;
    z: number;
}

export declare class LookAtPosDispatch {
    pos: Position;

    constructor(pos: Position);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default LookAtPosDispatch;