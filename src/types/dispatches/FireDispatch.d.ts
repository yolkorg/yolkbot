import Bot from '../bot';

export declare class FireDispatch {
    amount: number;

    constructor(amount?: number);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default FireDispatch;