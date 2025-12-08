import Bot from '../bot';

export type Params = [amount?: number];

export declare class FireDispatch {
    amount: number;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default FireDispatch;