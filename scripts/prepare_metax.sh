#!/usr/bin/env bash

targetTriple=$(rustc -Vv | grep host | cut -f2 -d' ')

mv apps/bin/meta-x apps/bin/meta-x-$targetTriple
