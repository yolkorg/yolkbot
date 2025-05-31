import Bot from '../bot';

export declare class ChatDispatch {
    msg: string;
    noLimit: boolean;

    constructor(msg: string, noLimit?: boolean);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ChatDispatch;