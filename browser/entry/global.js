import { API } from '../../src/api.js';
import { Bot } from '../../src/bot.js';
import { GamePlayer } from '../../src/bot/GamePlayer.js';

import { Matchmaker } from '../../src/matchmaker.js';

import { default as Dispatches } from '../../src/dispatches/index.js';

import * as Comm from '../../src/comm/index.js';

import * as Constants from '../../src/constants/index.js';
import * as Guns from '../../src/constants/guns.js';
import { Maps } from '../../src/constants/maps.js';

const yolkbot = {
    API,
    Bot,
    GamePlayer,
    Matchmaker,
    Dispatches,
    Comm,
    Constants,
    Guns,
    Maps
};

window.yolkbot = yolkbot;