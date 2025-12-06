import Bot from '../bot';

export type Params = [uniqueId: string, duration: number, reason?: string];

export declare class BanPlayerDispatch {
    uniqueId: string;
    duration: number;
    reason?: string;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default BanPlayerDispatch;