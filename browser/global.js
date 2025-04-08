import { Bot } from '../src/bot.js';
import { GamePlayer } from '../src/bot/GamePlayer.js';

import { Matchmaker } from '../src/matchmaker.js';

import { default as Dispatches } from '../src/dispatches/index.js';

import * as API from '../src/api.js';
import * as Comm from '../src/comm/index.js';

import * as Constants from '../src/constants/index.js';
import * as Guns from '../src/constants/guns.js';
import { Items } from '../src/constants/items.js';
import { Maps } from '../src/constants/maps.js';

const yolkbot = {
    Bot,
    GamePlayer,
    Matchmaker,
    Dispatches,
    API,
    Comm,
    Constants,
    Guns,
    Items,
    Maps
};

window.yolkbot = yolkbot;