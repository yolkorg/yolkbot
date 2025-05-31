import Bot from '../bot';

export class GoToGrenadeDispatch {
    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GoToGrenadeDispatch;