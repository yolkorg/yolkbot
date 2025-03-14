import Bot from '../bot';

export class ReloadDispatch {
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ReloadDispatch;