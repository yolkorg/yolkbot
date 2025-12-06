import Bot from '../bot';

export type Params = [msg: string];

export declare class ChatDispatch {
    msg: string;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ChatDispatch;