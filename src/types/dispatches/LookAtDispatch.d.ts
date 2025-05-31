import Bot from '../bot';

declare class LookAtDispatch {
    idOrName: string;

    constructor(idOrName: string);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default LookAtDispatch;