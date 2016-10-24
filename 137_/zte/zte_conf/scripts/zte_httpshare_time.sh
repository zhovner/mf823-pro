#!/bin/sh
 
# ---------------------------------------------------------------------------
# Copyright (c) 2010 ZTE Incorporated.
# All Rights Reserved. ZTE Proprietary and Confidential.
# ---------------------------------------------------------------------------


#echo "httpshare_change_time begin"

#echo $1
#echo $2
#sleep 1
touch -cm -d "$1" "$2"
#sleep 1
#echo "httpshare_change_time end"
