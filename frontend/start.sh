#!/bin/bash
export PORT=3000
export HOSTNAME=0.0.0.0
export NODE_ENV=production
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"
node .next/standalone/server.js

