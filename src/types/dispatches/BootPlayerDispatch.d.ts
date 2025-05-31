import Bot from '../bot';

export declare class BootPlayerDispatch {
    uniqueId: string;

    constructor(uniqueId: string);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default BootPlayerDispatch;