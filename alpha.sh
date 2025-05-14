latest_version=$(curl -s https://registry.npmjs.com/yolkbot | jq -r '.["dist-tags"].alpha')
current_version=$(jq -r '.version' ./package.json)

new_version=$(echo $latest_version | awk -F- '{print $NF}')
new_version=$((new_version + 1))
new_version="0.0.0-$new_version"

echo "publishing $new_version"

sed -i '' "s/$current_version/$new_version/g" package.json

bun cli/build.js
bun browser/compile.js

npm publish --tag alpha