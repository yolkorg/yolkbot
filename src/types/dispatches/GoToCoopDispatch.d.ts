import Bot from '../bot';

export class GoToCoopDispatch {
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GoToCoopDispatch;