#!/usr/bin/env bash

if [ $1 ]; then
    targetTriple=$1
else 
    targetTriple=$(rustc -Vv | grep host | cut -f2 -d' ')
fi

mv apps/bin/meta-x apps/bin/meta-x-$targetTriple
