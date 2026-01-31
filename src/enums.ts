export enum BanDuration {
    FiveMinutes = 0,
    FifteenMinutes = 1,
    OneHour = 2
}

export enum ChallengeSubType {
    Killstreak = 0,
    KillWithWeapon = 1,
    MovementDistance = 3,
    Jumping = 4,
    TimePlayed = 6,
    TimeAlive = 7,
    KillWithCondition = 8,
    TotalKills = 10,
    SpatulaKills = 10,
    Collecting = 18,
    FromTheCoop = 20,
    SpecialOffensive = 21,
    WinKOTC = 23,
    KillWithSpatula = 23
}

export enum ChallengeType {
    Kill = 0,
    Damage = 1,
    Death = 2,
    Movement = 3,
    Collect = 4,
    Time = 5,
    KOTC = 6,
    Spatula = 7
}

export enum ChatFlag {
    None = 0,
    Pinned = 2,
    Team = 4,
    Mod = 254,
    Server = 255
}

export enum CollectType {
    Ammo = 0,
    Grenade = 1
}

export enum CoopState {
    Start = 0,
    Score = 1,
    Win = 2,
    Capturing = 3,
    Contested = 4,
    Takeover = 5,
    Abandoned = 6,
    Unclaimed = 7
}

export enum GameAction {
    Reset = 1,
    Pause = 2
}

export enum GameMode {
    FFA = 0,
    Team = 1,
    Spatula = 2,
    KOTC = 3
}

export enum GameOptionFlag {
    Locked = 1,
    NoTeamChange = 2,
    NoTeamShuffle = 4
}

export enum ItemType {
    Hat = 1,
    Stamp = 2,
    Primary = 3,
    Secondary = 4,
    Grenade = 6,
    Melee = 7
};

export enum Movement {
    Forward = 1,
    Backward = 2,
    Left = 4,
    Right = 8,
    Jump = 16,
    Fire = 32, // useless
    Melee = 64, // useless
    Scope = 128 // useless
}

export enum PlayType {
    JoinPublic = 0,
    CreatePrivate = 1,
    JoinPrivate = 2
}

export enum ShellStreak {
    HardBoiled = 1,
    EggBreaker = 2,
    Restock = 4,
    OverHeal = 8,
    DoubleEggs = 16,
    MiniEgg = 32
}

export enum SocialMedia {
    Facebook = 0,
    Instagram = 1,
    Tiktok = 2,
    Discord = 3,
    Youtube = 4,
    Twitter = 5,
    Twitch = 6
}

export enum SocialReward {
    Discord = 'rew_1200',
    Tiktok = 'rew_1208',
    Instagram = 'rew_1219',
    Steam = 'rew_1223',
    Facebook = 'rew_1227',
    Twitter = 'rew_1234',
    Twitch = 'rew_twitch_social'
}

export enum Team {
    None = 0,
    Blue = 1,
    Red = 2
}

export enum APIError {
    WebSocketConnectFail = 'websocket_connect_fail',
    MissingParams = 'missing_params',
    NetworkFail = 'firebase_network_failed',
    ServicesClosedEarly = 'services_closed_early',
    InternalError = 'unknown_error',
    FirebaseRateLimited = 'firebase_rate_limited'
}

export enum LoginError {
    // start APIError
    WebSocketConnectFail = 'websocket_connect_fail',
    MissingParams = 'missing_params',
    NetworkFail = 'firebase_network_failed',
    ServicesClosedEarly = 'services_closed_early',
    InternalError = 'unknown_error',
    FirebaseRateLimited = 'firebase_rate_limited',
    // end APIError
    AccountBanned = 'account_banned'
}

export enum BuyItemError {
    SessionExpired = 'PLAYER_NOT_FOUND',
    ItemNotFound = 'ITEM_NOT_FOUND',
    ItemAlreadyOwned = 'ALREADY_OWNED',
    CannotAfford = 'INSUFFICIENT_FUNDS',
    InternalError = 'UNKNOWN_ERROR'
}

export enum ChicknWinnerError {
    OnCooldown = 'on_cooldown',
    HitDailyLimit = 'hit_daily_limit',
    NotAtDailyLimit = 'not_at_limit',
    NotEnoughResetEggs = 'not_enough_eggs',
    SessionExpired = 'session_expired',
    InternalError = 'unknown_error'
}

export enum GameFindError {
    MissingParams = 'missing_params',
    InvalidRegion = 'region_not_in_list',
    InvalidMode = 'mode_not_in_list',
    InvalidMap = 'map_not_in_list',
    GameNotFound = 'game_not_found',
    SessionExpired = 'session_expired',
    InternalError = 'unknown_error'
}

export enum GameJoinError {
    MissingParams = 'missing_params',
    InvalidObject = 'invalid_game_object',
    WebSocketConnectFail = 'websocket_connect_fail',
    GameNotFound = 'game_not_found',
    InternalError = 'unknown_error'
}

export enum MatchmakerError {
    WebSocketConnectFail = 'websocket_connect_fail'
}

export enum Intents {
    CHALLENGES = 1,
    BOT_STATS = 2,
    PATHFINDING = 3,
    PING = 5,
    COSMETIC_DATA = 6,
    PLAYER_HEALTH = 7,
    PACKET_HOOK = 8,
    LOG_PACKETS = 10,
    SKIP_LOGIN = 11,
    DEBUG_BUFFER = 12,
    NO_AFK_KICK = 16,
    LOAD_MAP = 17,
    OBSERVE_GAME = 18,
    RENEW_SESSION = 21,
    VIP_HIDE_BADGE = 22,
    SIMULATION = 23,
    MANUAL_UPDATE = 24,
    FASTER_RESPAWN = 25
}

export enum RedeemCodeError {
    SessionExpired = 'PLAYER_NOT_FOUND',
    CurrentlyRedeemingElsewhere = 'CODE_DOUBLE_DOUBLE',
    AlreadyRedeemed = 'CODE_PREV_REDEEMED',
    InvalidCode = 'CODE_NOT_FOUND',
    Ratelimited = 'RATE_LIMIT_REACHED',
    InternalError = 'UNKNOWN_ERROR'
}

export enum ClaimSocialError {
    SessionExpired = 'reward_expired_session',
    InvalidReward = 'REWARD_NOT_FOUND',
    AlreadyRedeemed = 'REWARD_PREV_GIVEN',
    InternalError = 'unknown_error'
}

export enum ClaimURLError {
    SessionExpired = 'urlRewardParams_expired_session',
    InvalidReward = 'REWARD_NOT_FOUND',
    AlreadyRedeemed = 'REWARD_PREV_GIVEN',
    InternalError = 'unknown_error'
}

export enum ChallengeRerollError {
    SessionExpired = 'challengeRerollSlot_expired_session',
    ChallengeNotFound = 'challenge_not_found',
    ChallengeNotAssigned = 'challenge_reroll_not_found',
    NotEnoughEggs = 'insufficient_eggs',
    InternalError = 'unknown_error'
}

export enum ChallengeClaimError {
    SessionExpired = 'challengeClaimReward_expired_session',
    ChallengeNotFound = 'challenge_claim_not_found',
    ChallengeNotCompleted = 'challenge_not_completed',
    InternalError = 'unknown_error'
}

export enum PathfindError {
    NoPathFound = 'no_path_found',
    PathTooShort = 'path_too_short'
}

export enum ZoneLeaveReason {
    Despawned = 'despawned',
    Killed = 'killed',
    WalkedOut = 'exited',
    RoundEnded = 'round_ended'
}

export enum CleanupLevel {
    None = 0,
    Partial = 1,
    Full = 2
}