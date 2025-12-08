import Bot from '../bot';

export type Params = [];

export class ReloadDispatch {
    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ReloadDispatch;