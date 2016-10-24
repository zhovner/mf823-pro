#-----------------------------------------------------------------------------
# Copyright (c) 2008-09,2012 QUALCOMM Incorporated.
# All Rights Reserved. QUALCOMM Proprietary and Confidential.
#-----------------------------------------------------------------------------

. $TEST_ENV_SETUP

set -e

for i in /dev/pmem*;
do
	if [ -c $i ]; then
		./_pmem_test $* $i
	fi
done
