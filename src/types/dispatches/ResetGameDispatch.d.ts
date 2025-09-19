import Bot from '../bot';

export class ResetGameDispatch {
    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ResetGameDispatch;