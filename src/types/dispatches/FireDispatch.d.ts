import Bot from '../bot';

export declare class FireDispatch {
    constructor(amount: number);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default FireDispatch;