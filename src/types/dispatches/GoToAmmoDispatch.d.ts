import Bot from '../bot';

export class GoToAmmoDispatch {
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GoToAmmoDispatch;