printf "from JS...\n"

bun cli/scrape/fromJS/challenges.js
bun cli/scrape/fromJS/changelog.js
bun cli/scrape/fromJS/items.js
bun cli/scrape/fromJS/maps.js
bun cli/scrape/fromJS/shopItems.js

printf "\nfrom JSON...\n"

bun cli/scrape/fromJSON/codes.js
bun cli/scrape/fromJSON/housePromo.js
bun cli/scrape/fromJSON/language.js
bun cli/scrape/fromJSON/shellNews.js
bun cli/scrape/fromJSON/shellYoutube.js
bun cli/scrape/fromJSON/sounds.js

printf "\n"
echo "scraping complete!"