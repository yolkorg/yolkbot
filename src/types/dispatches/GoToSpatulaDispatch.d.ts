import Bot from '../bot';

export class GoToSpatulaDispatch {
    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GoToSpatulaDispatch;