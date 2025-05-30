import Bot from '../bot';

export declare class ChatDispatch {
    msg: string;

    constructor(msg: string);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ChatDispatch;