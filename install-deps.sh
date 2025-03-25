#!/bin/sh
# used by dockerfile to install dependencies during build stages to reduce duplication
set -ex
apk update && apk add --no-cache pkgconfig libseccomp-dev gcc musl-dev
