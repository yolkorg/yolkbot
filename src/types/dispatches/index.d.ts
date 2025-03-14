import BootPlayerDispatch from './BootPlayerDispatch';
import ChatDispatch from './ChatDispatch';
import FireDispatch from './FireDispatch';
import GameOptionsDispatch from './GameOptionsDispatch';
import GoToPlayerDispatch from './GoToPlayerDispatch';
import GoToSpatulaDispatch from './GoToSpatulaDispatch';
import LookAtDispatch from './LookAtDispatch';
import LookAtPosDispatch from './LookAtPosDispatch';
import MeleeDispatch from './MeleeDispatch';
import MovementDispatch from './MovementDispatch';
import PauseDispatch from './PauseDispatch';
import ReloadDispatch from './ReloadDispatch';
import ReportPlayerDispatch from './ReportPlayerDispatch';
import SaveLoadoutDispatch from './SaveLoadoutDispatch';
import SpawnDispatch from './SpawnDispatch';
import SwapWeaponDispatch from './SwapWeaponDispatch';
import SwitchTeamDispatch from './SwitchTeamDispatch';
import ThrowGrenadeDispatch from './ThrowGrenadeDispatch';

declare module 'BootPlayerDispatch' {
    export default BootPlayerDispatch;
}

declare module 'ChatDispatch' {
    export default ChatDispatch;
}

declare module 'FireDispatch' {
    export default FireDispatch;
}

declare module 'GameOptionsDispatch' {
    export default GameOptionsDispatch;
}

declare module 'GoToPlayerDispatch' {
    export default GoToPlayerDispatch;
}

declare module 'GoToSpatulaDispatch' {
    export default GoToSpatulaDispatch;
}

declare module 'LookAtDispatch' {
    export default LookAtDispatch;
}

declare module 'LookAtPosDispatch' {
    export default LookAtPosDispatch;
}

declare module 'MeleeDispatch' {
    export default MeleeDispatch;
}

declare module 'MovementDispatch' {
    export default MovementDispatch;
}

declare module 'PauseDispatch' {
    export default PauseDispatch;
}

declare module 'ReloadDispatch' {
    export default ReloadDispatch;
}

declare module 'ReportPlayerDispatch' {
    export default ReportPlayerDispatch;
}

declare module 'SaveLoadoutDispatch' {
    export default SaveLoadoutDispatch;
}

declare module 'SpawnDispatch' {
    export default SpawnDispatch;
}

declare module 'SwapWeaponDispatch' {
    export default SwapWeaponDispatch;
}

declare module 'SwitchTeamDispatch' {
    export default SwitchTeamDispatch;
}

declare module 'dispatches' {
    export {
        BootPlayerDispatch,
        ChatDispatch,
        FireDispatch,
        GameOptionsDispatch,
        GoToPlayerDispatch,
        GoToSpatulaDispatch,
        LookAtDispatch,
        LookAtPosDispatch,
        MeleeDispatch,
        MovementDispatch,
        PauseDispatch,
        ReloadDispatch,
        ReportPlayerDispatch,
        SaveLoadoutDispatch,
        SpawnDispatch,
        SwapWeaponDispatch,
        SwitchTeamDispatch
    }

    const dispatches: {
        BootPlayerDispatch: typeof BootPlayerDispatch,
        ChatDispatch: typeof ChatDispatch,
        FireDispatch: typeof FireDispatch,
        GameOptionsDispatch: typeof GameOptionsDispatch,
        GoToPlayerDispatch: typeof GoToPlayerDispatch,
        GoToSpatulaDispatch: typeof GoToSpatulaDispatch,
        LookAtDispatch: typeof LookAtDispatch,
        LookAtPosDispatch: typeof LookAtPosDispatch,
        MeleeDispatch: typeof MeleeDispatch,
        MovementDispatch: typeof MovementDispatch,
        PauseDispatch: typeof PauseDispatch,
        ReloadDispatch: typeof ReloadDispatch,
        ReportPlayerDispatch: typeof ReportPlayerDispatch,
        SaveLoadoutDispatch: typeof SaveLoadoutDispatch,
        SpawnDispatch: typeof SpawnDispatch,
        SwapWeaponDispatch: typeof SwapWeaponDispatch,
        SwitchTeamDispatch: typeof SwitchTeamDispatch
    };

    export default dispatches;
}

export type ADispatch = BootPlayerDispatch | ChatDispatch | FireDispatch | GameOptionsDispatch | GoToPlayerDispatch | GoToSpatulaDispatch | LookAtDispatch | LookAtPosDispatch | MeleeDispatch | MovementDispatch | PauseDispatch | ReloadDispatch | ReportPlayerDispatch | SaveLoadoutDispatch | SpawnDispatch | SwapWeaponDispatch | SwitchTeamDispatch | ThrowGrenadeDispatch;