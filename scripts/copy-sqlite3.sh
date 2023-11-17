#!/bin/bash

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

rm -rf "${SCRIPTS_DIR}"/../public/worker
mkdir -p "${SCRIPTS_DIR}"/../public/worker/
cp -r "${SCRIPTS_DIR}"/../node_modules/@new-mareland/crystal-mirror-browser-storage/dist/* "${SCRIPTS_DIR}"/../public/worker/
