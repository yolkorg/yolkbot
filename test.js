import Bot from './src/bot.js';
import { Challenges } from './src/constants/challenges.js';

const bot = new Bot();
const acc = await bot.loginAnonymously();
console.log(acc);

console.log(Challenges.length);
console.log(Challenges[0]);
console.log(Challenges[0].id);