latest_version=$(curl -s https://registry.npmjs.com/yolkbot-alpha | jq -r '.["dist-tags"].latest')
current_version=$(jq -r '.version' ./package.json)

if [[ "$current_version" != *"-alpha."* ]]; then
    echo "Please adjust the current version before publishing."
    exit 1
fi

if [ "$latest_version" == "$current_version" ]; then
    echo "Please bump the alpha version before publishing."
    exit 1
fi

if [ "$(printf '%s\n' "$latest_version" "$current_version" | sort -V | head -n1)" != "$latest_version" ]; then
    echo "The current version must be greater than the latest published version."
    exit 1
fi

node cli/browser.js
npm publish --tag alpha
node --env-file=.env cli/publish/alpha.js