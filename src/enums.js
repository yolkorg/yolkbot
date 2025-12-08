export const APIError = {
    WebSocketConnectFail: 'websocket_connect_fail',
    MissingParams: 'missing_params',
    NetworkFail: 'firebase_network_failed',
    ServicesClosedEarly: 'services_closed_early',
    InternalError: 'unknown_error'
}

export const LoginError = {
    ...APIError,
    AccountBanned: 'account_banned'
}

export const BuyItemError = {
    SessionExpired: 'PLAYER_NOT_FOUND',
    ItemNotFound: 'ITEM_NOT_FOUND',
    ItemAlreadyOwned: 'ALREADY_OWNED',
    CannotAfford: 'INSUFFICIENT_FUNDS',
    InternalError: 'UNKNOWN_ERROR'
}

export const ChicknWinnerError = {
    OnCooldown: 'on_cooldown',
    HitDailyLimit: 'hit_daily_limit',
    NotAtDailyLimit: 'not_at_limit',
    NotEnoughResetEggs: 'not_enough_eggs',
    SessionExpired: 'session_expired',
    InternalError: 'unknown_error'
}

export const GameFindError = {
    MissingParams: 'missing_params',
    InvalidRegion: 'region_not_in_list',
    InvalidMode: 'mode_not_in_list',
    InvalidMap: 'map_not_in_list',
    GameNotFound: 'game_not_found',
    SessionExpired: 'session_expired',
    InternalError: 'unknown_error'
}

export const GameJoinError = {
    MissingParams: 'missing_params',
    InvalidObject: 'invalid_game_object',
    WebSocketConnectFail: 'websocket_connect_fail',
    InternalError: 'unknown_error'
}

export const MatchmakerError = {
    WebSocketConnectFail: 'websocket_connect_fail'
}

export const Intents = {
    CHALLENGES: 1,
    BOT_STATS: 2,
    PATHFINDING: 3,
    PING: 5,
    COSMETIC_DATA: 6,
    PLAYER_HEALTH: 7,
    PACKET_HOOK: 8,
    LOG_PACKETS: 10,
    NO_LOGIN: 11,
    DEBUG_BUFFER: 12,
    NO_AFK_KICK: 16,
    LOAD_MAP: 17,
    OBSERVE_GAME: 18,
    NO_REGION_CHECK: 19,
    NO_EXIT_ON_ERROR: 20,
    RENEW_SESSION: 21,
    VIP_HIDE_BADGE: 22
}

export const RedeemCodeError = {
    SessionExpired: 'PLAYER_NOT_FOUND',
    CurrentlyRedeemingElsewhere: 'CODE_DOUBLE_DOUBLE',
    AlreadyRedeemed: 'CODE_PREV_REDEEMED',
    InvalidCode: 'CODE_NOT_FOUND',
    Ratelimited: 'RATE_LIMIT_REACHED',
    InternalError: 'UNKNOWN_ERROR'
}

export const ClaimSocialError = {
    SessionExpired: 'reward_expired_session',
    InvalidReward: 'REWARD_NOT_FOUND',
    AlreadyRedeemed: 'REWARD_PREV_GIVEN'
}

export const ClaimURLError = {
    SessionExpired: 'urlRewardParams_expired_session',
    InvalidReward: 'REWARD_NOT_FOUND',
    AlreadyRedeemed: 'REWARD_PREV_GIVEN'
}