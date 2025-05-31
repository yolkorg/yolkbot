import Bot from '../bot';

export class SpawnDispatch {
    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default SpawnDispatch;