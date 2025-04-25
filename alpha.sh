latest_version=$(curl -s https://registry.npmjs.com/yolkbot | jq -r '.["dist-tags"].alpha')
current_version=$(jq -r '.version' ./package.json)

if [[ "$current_version" != *"-alpha."* ]]; then
    echo "The version provided is not a valid alpha version."
    exit 1
fi

new_version=$(echo "$current_version" | awk -F. -v OFS=. '{$NF = $NF + 1; print}')
sed -i '' "s/$current_version/$new_version/g" package.json

current_version=$new_version

if [[ "$latest_version" == *"-alpha."* || "$current_version" == *"-alpha."* ]]; then
    latest_version_numeric=$(echo "$latest_version" | sed 's/-alpha\.[0-9]*//')
    current_version_numeric=$(echo "$current_version" | sed 's/-alpha\.[0-9]*//')

    if [ "$latest_version_numeric" == "$current_version_numeric" ]; then
        latest_alpha=$(echo "$latest_version" | sed 's/.*-alpha\.//')
        current_alpha=$(echo "$current_version" | sed 's/.*-alpha\.//')

        if [ "$current_alpha" -le "$latest_alpha" ]; then
            echo "The current alpha version must be greater than the latest published alpha version."
            exit 1
        fi
    fi
fi

if [ "$(printf '%s\n' "$latest_version" "$current_version" | sort -V | head -n1)" != "$latest_version" ]; then
    echo "The current version must be greater than the latest published version."
    exit 1
fi

bun cli/build.js
bun browser/compile.js

npm publish --tag alpha
bun --env-file=.env cli/publish/alpha.js