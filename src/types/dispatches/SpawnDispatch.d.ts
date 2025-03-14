import Bot from '../bot';

export class SpawnDispatch {
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default SpawnDispatch;