import Bot from '../bot';

export class ReloadDispatch {
    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ReloadDispatch;