import Bot from '../bot';

export type Params = [];

export class MeleeDispatch {
    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default MeleeDispatch;