#!/bin/sh --
set -e
cd `dirname $0` && exec ./msm_watchdog_test.sh $@
