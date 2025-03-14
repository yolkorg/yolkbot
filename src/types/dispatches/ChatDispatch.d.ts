import Bot from '../bot';

export declare class ChatDispatch {
    constructor(msg: string, noLimit?: boolean);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ChatDispatch;