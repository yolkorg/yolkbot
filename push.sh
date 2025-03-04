node cli/browser.js
output=$(git push 2>&1)

if [[ $output == *"Everything up-to-date"* ]]; then
    echo "You need to git add & git commit changes. This file is only supposed to replace git push."
else
    echo "$output"
fi