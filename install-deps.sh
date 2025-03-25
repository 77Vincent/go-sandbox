#!/bin/sh
set -ex
apk update && apk add --no-cache pkgconfig libseccomp-dev gcc musl-dev
