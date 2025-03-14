import Bot from '../bot';

export class MeleeDispatch {
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default MeleeDispatch;