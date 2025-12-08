import BanPlayerDispatch, { Params as BanPlayerParams } from './BanPlayerDispatch';
import BootPlayerDispatch, { Params as BootPlayerParams } from './BootPlayerDispatch';
import ChatDispatch, { Params as ChatParams } from './ChatDispatch';
import FireDispatch, { Params as FireParams } from './FireDispatch';
import GameOptionsDispatch, { Params as GameOptionsParams } from './GameOptionsDispatch';
import GoToAmmoDispatch, { Params as GoToAmmoParams } from './GoToAmmoDispatch';
import GoToCoopDispatch, { Params as GoToCoopParams } from './GoToCoopDispatch';
import GoToGrenadeDispatch, { Params as GoToGrenadeParams } from './GoToGrenadeDispatch';
import GoToPlayerDispatch, { Params as GoToPlayerParams } from './GoToPlayerDispatch';
import GoToSpatulaDispatch, { Params as GoToSpatulaParams } from './GoToSpatulaDispatch';
import LookAtDispatch, { Params as LookAtParams } from './LookAtDispatch';
import LookAtPosDispatch, { Params as LookAtPosParams } from './LookAtPosDispatch';
import MeleeDispatch, { Params as MeleeParams } from './MeleeDispatch';
import MovementDispatch, { Params as MovementParams } from './MovementDispatch';
import PauseDispatch, { Params as PauseParams } from './PauseDispatch';
import ReloadDispatch, { Params as ReloadParams } from './ReloadDispatch';
import ReportPlayerDispatch, { Params as ReportPlayerParams } from './ReportPlayerDispatch';
import ResetGameDispatch, { Params as ResetGameParams } from './ResetGameDispatch';
import SaveLoadoutDispatch, { Params as SaveLoadoutParams } from './SaveLoadoutDispatch';
import SpawnDispatch, { Params as SpawnParams } from './SpawnDispatch';
import SwapWeaponDispatch, { Params as SwapWeaponParams } from './SwapWeaponDispatch';
import SwitchTeamDispatch, { Params as SwitchTeamParams } from './SwitchTeamDispatch';
import ThrowGrenadeDispatch, { Params as ThrowGrenadeParams } from './ThrowGrenadeDispatch';

export interface DispatchParams {
    banPlayer: BanPlayerParams;
    bootPlayer: BootPlayerParams;
    chat: ChatParams;
    fire: FireParams;
    gameOptions: GameOptionsParams;
    goToAmmo: GoToAmmoParams;
    goToCoop: GoToCoopParams;
    goToGrenade: GoToGrenadeParams;
    goToPlayer: GoToPlayerParams;
    goToSpatula: GoToSpatulaParams;
    lookAt: LookAtParams;
    lookAtPos: LookAtPosParams;
    melee: MeleeParams;
    movement: MovementParams;
    pause: PauseParams;
    reload: ReloadParams;
    reportPlayer: ReportPlayerParams;
    resetGame: ResetGameParams;
    saveLoadout: SaveLoadoutParams;
    spawn: SpawnParams;
    swapWeapon: SwapWeaponParams;
    switchTeam: SwitchTeamParams;
    throwGrenade: ThrowGrenadeParams;
}

export declare const DispatchIndex: {
    'banPlayer': BanPlayerDispatch,
    'bootPlayer': BootPlayerDispatch,
    'chat': ChatDispatch,
    'fire': FireDispatch,
    'gameOptions': GameOptionsDispatch,
    'goToAmmo': GoToAmmoDispatch,
    'goToCoop': GoToCoopDispatch,
    'goToGrenade': GoToGrenadeDispatch,
    'goToPlayer': GoToPlayerDispatch,
    'goToSpatula': GoToSpatulaDispatch,
    'lookAt': LookAtDispatch,
    'lookAtPos': LookAtPosDispatch,
    'melee': MeleeDispatch,
    'movement': MovementDispatch,
    'pause': PauseDispatch,
    'reload': ReloadDispatch,
    'reportPlayer': ReportPlayerDispatch,
    'resetGame': ResetGameDispatch,
    'saveLoadout': SaveLoadoutDispatch,
    'spawn': SpawnDispatch,
    'swapWeapon': SwapWeaponDispatch,
    'switchTeam': SwitchTeamDispatch,
    'throwGrenade': ThrowGrenadeDispatch
}

declare const _default: {
    BanPlayerDispatch: typeof BanPlayerDispatch,
    BootPlayerDispatch: typeof BootPlayerDispatch,
    ChatDispatch: typeof ChatDispatch,
    FireDispatch: typeof FireDispatch,
    GameOptionsDispatch: typeof GameOptionsDispatch,
    GoToAmmoDispatch: typeof GoToAmmoDispatch,
    GoToCoopDispatch: typeof GoToCoopDispatch,
    GoToGrenadeDispatch: typeof GoToGrenadeDispatch,
    GoToPlayerDispatch: typeof GoToPlayerDispatch,
    GoToSpatulaDispatch: typeof GoToSpatulaDispatch,
    LookAtDispatch: typeof LookAtDispatch,
    LookAtPosDispatch: typeof LookAtPosDispatch,
    MeleeDispatch: typeof MeleeDispatch,
    MovementDispatch: typeof MovementDispatch,
    PauseDispatch: typeof PauseDispatch,
    ReloadDispatch: typeof ReloadDispatch,
    ReportPlayerDispatch: typeof ReportPlayerDispatch,
    ResetGameDispatch: typeof ResetGameDispatch,
    SaveLoadoutDispatch: typeof SaveLoadoutDispatch,
    SpawnDispatch: typeof SpawnDispatch,
    SwapWeaponDispatch: typeof SwapWeaponDispatch,
    SwitchTeamDispatch: typeof SwitchTeamDispatch,
    ThrowGrenadeDispatch: typeof ThrowGrenadeDispatch
};

export default _default;

export type ADispatch = typeof DispatchIndex[keyof typeof DispatchIndex];