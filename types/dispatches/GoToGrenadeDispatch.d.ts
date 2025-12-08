import Bot from '../bot';

export type Params = [];

export class GoToGrenadeDispatch {
    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GoToGrenadeDispatch;