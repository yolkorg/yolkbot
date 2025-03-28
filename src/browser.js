import { Bot } from './bot.js';
import { GamePlayer } from './bot/GamePlayer.js';

import { Matchmaker } from './matchmaker.js';

import { default as Dispatches } from './dispatches/index.js';

import * as API from './api.js';
import * as Comm from './comm/index.js';
import * as Packet from './packet.js';

import * as Constants from './constants/index.js';
import * as Guns from './constants/guns.js';
import { Items } from './constants/items.js';
import { Maps } from './constants/maps.js';

const yolkbot = {
    Bot,
    GamePlayer,
    Matchmaker,
    Dispatches,
    API,
    Comm,
    Packet,
    Constants,
    Guns,
    Items,
    Maps
};

window.yolkbot = yolkbot;

export { Bot };
export { GamePlayer };
export { Matchmaker };
export { Dispatches };
export { API };
export { Comm };
export { Packet };
export { Constants };
export { Guns };
export { Items };
export { Maps };