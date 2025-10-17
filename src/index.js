const red = '\x1b[31m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

console.error([
    red,
    'how NOT to import yolkbot:',
    '> import yolkbot from "yolkbot";',
    green,
    'how to PROPERLY import yolkbot:',
    '> import yolkbot from "yolkbot/bot";',
    'please adjust your code.',
    reset
].join('\n'));