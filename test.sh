rm -rf ./build/
mkdir build

version=$(jq -r '.version' package.json)
buildId=$RANDOM

npm pack --pack-destination ./build/

mv build/yolkbot-${version}.tgz build/yolkbot-${buildId}.tgz

cd ../yolkdev || exit 1

bun rm yolkbot
bun i file:../yolkbot/build/yolkbot-${buildId}.tgz

cd ../yolkbot || exit 1