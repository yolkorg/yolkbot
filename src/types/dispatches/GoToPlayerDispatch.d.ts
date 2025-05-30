import Bot from '../bot';

export declare class GoToPlayerDispatch {
    idOrName: string;

    constructor(idOrName: string);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GoToPlayerDispatch;