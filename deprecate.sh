#!/bin/bash

version="$1"
if [ -z "$version" ] || ! printf '%s' "$version" | grep -Eq '^1\.[0-9]+\.[0-9]+$'; then
  echo "usage: ./deprecate.sh 1.x.x"
  exit 1
fi

npm deprecate yolkbot@">0.0.0 <=$version" "this version of yolkbot is no longer supported. please upgrade to the latest version."