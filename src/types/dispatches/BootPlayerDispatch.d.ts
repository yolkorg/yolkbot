import Bot from '../bot';

export type Params = [uniqueId: string];

export declare class BootPlayerDispatch {
    uniqueId: string;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default BootPlayerDispatch;