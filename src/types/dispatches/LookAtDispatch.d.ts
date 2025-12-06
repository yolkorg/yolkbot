import Bot from '../bot';

export type Params = [idOrName: string];

declare class LookAtDispatch {
    idOrName: string;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default LookAtDispatch;