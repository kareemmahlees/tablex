#!/usr/bin/env bash

re="host:[[:space:]].+"

if [[ `rustc -Vv` =~ $re ]]; then
    IFS=' ' read -ra res <<< "${BASH_REMATCH[0]}"
    targetTriple="${res[1]}"

    mv apps/bin/meta-x apps/bin/meta-x-$targetTriple
else
    echo "Unable to parse the string."
fi
