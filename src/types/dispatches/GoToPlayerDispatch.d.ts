import Bot from '../bot';

export type Params = [idOrName: string];

export declare class GoToPlayerDispatch {
    idOrName: string;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GoToPlayerDispatch;