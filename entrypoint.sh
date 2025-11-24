#!/bin/sh
set -e

# Start gopls in the background
gopls -rpc.trace -logfile=/tmp/gopls.log -listen=:4389 &

# Start the main server (in foreground)
exec ./server