// keep enums.js up to date

export enum APIErrorEnum {
    WebSocketConnectFail = 'websocket_connect_fail',
    MissingParams = 'missing_params',
    NetworkFail = 'firebase_network_failed',
    ServicesClosedEarly = 'services_closed_early',
    InternalError = 'unknown_error'
}

export interface APIError { ok: false, error: APIErrorEnum }

export enum LoginErrorEnum {
    AccountBanned = 'account_banned'
}

export type LoginError = APIError | { ok: false, error: LoginErrorEnum };

export enum BuyItemErrorEnum {
    SessionExpired = 'PLAYER_NOT_FOUND',
    ItemNotFound = 'ITEM_NOT_FOUND',
    ItemAlreadyOwned = 'ALREADY_OWNED',
    CannotAfford = 'INSUFFICIENT_FUNDS',
    InternalError = 'UNKNOWN_ERROR'
}

export type BuyItemError = { ok: false, error: BuyItemErrorEnum };

export enum ChicknWinnerErrorEnum {
    OnCooldown = 'on_cooldown',
    HitDailyLimit = 'hit_daily_limit',
    NotAtDailyLimit = 'not_at_limit',
    NotEnoughResetEggs = 'not_enough_eggs',
    SessionExpired = 'session_expired',
    InternalError = 'unknown_error'
}

export type ChicknWinnerError = { ok: false, error: ChicknWinnerErrorEnum };

export enum GameFindErrorEnum {
    MissingParams = 'missing_params',
    InvalidRegion = 'region_not_in_list',
    InvalidMode = 'mode_not_in_list',
    InvalidMap = 'map_not_in_list',
    GameNotFound = 'game_not_found',
    SessionExpired = 'session_expired',
    InternalError = 'unknown_error'
}

export type GameFindError = { ok: false, error: GameFindErrorEnum };

export enum GameJoinErrorEnum {
    MissingParams = 'missing_params',
    InvalidObject = 'invalid_game_object',
    WebSocketConnectFail = 'websocket_connect_fail',
    InternalError = 'unknown_error'
}

export type GameJoinError = { ok: false, error: GameJoinErrorEnum };

export enum MatchmakerErrorEnum {
    WebSocketConnectFail = 'websocket_connect_fail'
}

export type MatchmakerError = { ok: false, error: MatchmakerErrorEnum };

export enum Intents {
    CHALLENGES = 1,
    BOT_STATS = 2,
    PATHFINDING = 3,
    PING = 5,
    COSMETIC_DATA = 6,
    PLAYER_HEALTH = 7,
    PACKET_HOOK = 8,
    LOG_PACKETS = 10,
    NO_LOGIN = 11,
    DEBUG_BUFFER = 12,
    NO_AFK_KICK = 16,
    LOAD_MAP = 17,
    OBSERVE_GAME = 18,
    NO_REGION_CHECK = 19,
    NO_EXIT_ON_ERROR = 20,
    RENEW_SESSION = 21,
    VIP_HIDE_BADGE = 22
}

export enum RedeemCodeErrorEnum {
    SessionExpired = 'PLAYER_NOT_FOUND',
    CurrentlyRedeemingElsewhere = 'CODE_DOUBLE_DOUBLE',
    AlreadyRedeemed = 'CODE_PREV_REDEEMED',
    InvalidCode = 'CODE_NOT_FOUND',
    Ratelimited = 'RATE_LIMIT_REACHED',
    InternalError = 'UNKNOWN_ERROR'
}

export type RedeemCodeError = { ok: false, error: RedeemCodeErrorEnum };

export enum ClaimSocialErrorEnum {
    SessionExpired = 'reward_expired_session',
    InvalidReward = 'REWARD_NOT_FOUND',
    AlreadyRedeemed = 'REWARD_PREV_GIVEN',
    InternalError = 'unknown_error'
}

export type ClaimSocialError = { ok: false, error: ClaimSocialErrorEnum };

export enum ClaimURLErrorEnum {
    SessionExpired = 'urlRewardParams_expired_session',
    InvalidReward = 'REWARD_NOT_FOUND',
    AlreadyRedeemed = 'REWARD_PREV_GIVEN',
    InternalError = 'unknown_error'
}

export type ClaimURLError = { ok: false, error: ClaimURLErrorEnum };

export enum ChallengeRerollErrorEnum {
    SessionExpired = 'challengeRerollSlot_expired_session',
    ChallengeNotFound = 'challenge_not_found',
    ChallengeNotAssigned = 'challenge_reroll_not_found',
    NotEnoughEggs = 'insufficient_eggs',
}

export type ChallengeRerollError = { ok: false, error: ChallengeRerollErrorEnum };

export enum ChallengeClaimErrorEnum {
    SessionExpired = 'challengeClaimReward_expired_session',
    ChallengeNotFound = 'challenge_claim_not_found',
    ChallengeNotCompleted = 'challenge_not_completed',
    InternalError = 'unknown_error'
}

export type ChallengeClaimError = { ok: false, error: ChallengeClaimErrorEnum };