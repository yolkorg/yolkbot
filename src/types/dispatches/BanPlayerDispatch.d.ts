import Bot from '../bot';

export declare class BanPlayerDispatch {
    uniqueId: string;
    duration: number;
    reason?: string;

    constructor(uniqueId: string, duration: number, reason?: string);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default BanPlayerDispatch;