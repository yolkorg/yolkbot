#!/bin/bash

rm -rf ./builds/
mkdir builds

version=$(jq -r '.version' package.json)
buildId=$RANDOM

npm pack --pack-destination ./builds/

mv builds/yolkbot-${version}.tgz builds/yolkbot-${buildId}.tgz

cd ../yolkdev || exit 1

bun rm yolkbot
bun i file:../yolkbot/builds/yolkbot-${buildId}.tgz

cd ../yolkbot || exit 1