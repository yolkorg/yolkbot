import Bot from '../bot';

declare class LookAtDispatch {
    idOrName: number | string;
    id?: number;
    name?: string;

    constructor(idOrName: number | string);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default LookAtDispatch;