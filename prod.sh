sed -i '' 's/yolkbot-alpha/yolkbot/g' ./package.json
npm publish
node --env-file=.env scripts/prodpublish.js