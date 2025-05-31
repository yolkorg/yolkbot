const red = '\x1b[31m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

console[typeof window !== 'undefined' ? 'log' : 'error'](
    red + '\n' +
    'how NOT to import a bot:\n' +
    'import Bot from "yolkbot";\n' +
    reset + green + '\n' +
    'how to PROPERLY import a bot:\n' +
    'import Bot from "yolkbot/bot";\n' +
    'please adjust your code.\n' +
    reset
);