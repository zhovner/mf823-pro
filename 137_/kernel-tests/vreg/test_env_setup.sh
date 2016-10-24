################################################################################
# Copyright (c) 2009-2011 QUALCOMM Incorporated.  All Rights Reserved.
# QUALCOMM Proprietary and Confidential.
#
################################################################################

# This script is meant to be sourced by test scripts to set up the enviroment
# properly for either either ANDROID or LE builds.

# For ANDROID builds, busybox should be properly installed and its location should
# be included in the PATH since this script requires test [ ] or anything else from
# busybox.

# The script exports the following values
# TEST_TARGET = {ANDROID | CHROMIUM | LE}
# TEST_MNT = Directory used for mounts
# TEST_TMP = Temp directory
# TEST_DEBUG_FS = Directory mounting debugfs rw
# TARGET_TYPE = {7X27 | 7X30 | 8650 | 8650A | 8660 | 8960 | 9615}

# If any of the TEST_* and TARGET_TYPE are already defined the script will validate them,
# but it will not overwrite them.

# Note that we can't use test [ ] or anything else
# from busybox until we have verified that it is
# properly installed for ANDROID builds

# Default locations for ANDROID and LE
# /proc and /dev are assumed to exist at that location for both build
# types

and_test_mnt="$ANDROID_DATA/mnt"
le_test_mnt="/mnt"

and_test_tmp="$ANDROID_DATA/tmp"
le_test_tmp="/tmp"

and_test_debug="$ANDROID_DATA/debug"
cr_test_debug="/sys/kernel/debug"
le_test_debug="/debug"


# Determine TEST_TARGET
if [ $TEST_TARGET ]; then
    if [ $TEST_TARGET = "ANDROID" ] || [ $TEST_TARGET = "CHROMIUM" ] ||
        [ $TEST_TARGET = "LE" ]; then
	test_target=$TEST_TARGET
    else
	echo "Unrecognized TEST_TARGET: $TEST_TARGET"
	exit 1
    fi
elif [ $ANDROID_ROOT ]; then
    test_target="ANDROID"
else 
    test_target="LE"
fi

# Determine TEST_MNT, create directory if it does not exist
if [ $TEST_MNT ]; then
    test_mnt=$TEST_MNT
else
    if [ $test_target = "ANDROID" ]; then
	test_mnt=$and_test_mnt
    else
	test_mnt=$le_test_mnt
    fi
fi

if ! ( [ -e $test_mnt ] || mkdir $test_mnt ); then
    echo "Cannot create $test_mnt for TEST_MNT"
    exit 1
elif ! [ -d $test_mnt ]; then
    echo "$test_mnt is not a directory, cannot be used for TEST_MNT"
    exit 1
elif ! [ -r $test_mnt ] || ! [ -w $test_mnt ] || ! [ -x $test_mnt ]; then
    echo "Incorrect permissions for TEST_MNT: $test_mnt"
    exit 1
fi


# Determine TEST_MNT, create directory if it does not exist
if [ $TEST_TMP ]; then
    test_tmp=$TEST_TMP
else
    if [ $test_target = "ANDROID" ]; then
	test_tmp=$and_test_tmp
    else
	test_tmp=$le_test_tmp
    fi
fi

if ! ( [ -e $test_tmp ] || mkdir $test_tmp ); then
    echo "Cannot create $test_tmp for TEST_TMP"
    exit 1
elif ! [ -d $test_tmp ]; then
    echo "$test_tmp is not a directory, cannot be used for TEST_TMP"
    exit 1
elif ! [ -r $test_tmp ] || ! [ -w $test_tmp ] || ! [ -x $test_tmp ]; then
    echo "Incorrect permissions for TEST_TMP: $test_tmp"
    exit 1
fi


# Determine TEST_DEBUG_FS 
if [ $TEST_DEBUG_FS ]; then
    test_debug_fs=$TEST_DEBUG_FS
else
    case "$test_target" in
        ANDROID)    test_debug_fs=$and_test_debug ;;
        CHROMIUM)   test_debug_fs=$cr_test_debug ;;
        *)          test_debug_fs=$le_test_debug ;;
    esac
fi

if ! [ -e $test_debug_fs ]; then
     if ! mkdir $test_debug_fs ; then
	 echo "Failed to create dir $test_debug_fs"
     fi
fi

debug_mnt=`mount | grep -m 1 '^debugfs.*\<rw\>.*' | awk -F'[[:space:]]+(on)?[[:space:]]*' '{print $2}'`

new_mnt="TRUE"

if ! [ $debug_mnt ]; then
    new_mnt="TRUE"
elif [ $test_debug_fs -ef $debug_mnt ]; then
    new_mnt="FALSE"
fi

if [ "$new_mnt" = "TRUE" ]; then
    if ! mount -t debugfs debugfs $test_debug_fs ; then
	echo "Failed to create new debugfs mount on $test_debug_fs"
	exit 1
    fi    
fi

#function to get target type
get_target_type(){
# 8650B -> 8650; 8650D -> 8650A 9x15 -> 9615; copper -> 8974
target_lists="7X27 7X30 8650B 8650D 8660 8960 9x15 copper"

if [ -e /sys/devices/system/soc/soc0/build_id ]; then
    build_id=`cat /sys/devices/system/soc/soc0/build_id`
else
    echo "soc build_id doesn't exist"
    return 1
fi

# 7x27 has an ambiguous build_id
# so check as a special case
build_id=`cat /sys/devices/system/soc/soc0/build_id | sed -e 's/^76XXT-.*//'`
if [ "$build_id" == "" ]; then
    target_name="7X27"
    return 0
fi

for i in $target_lists
do

    check_name=`echo $build_id | sed -e "s/^$i.*//"`

    if [ "$check_name" != "$build_id" ]; then
	if [ "$i" = "8650B" ];then
            target_name="8650"
	elif [ "$i" = "8650D" ];then
            target_name="8650A"
	elif [ "$i" = "9x15" ];then
            target_name="9615"
	elif [ "$i" = "copper" ];then
            target_name="8974"
	else
            target_name=$i
	fi
	return 0
    fi
done

echo "can't detect target type"
return 1
}


if [ "$TARGET_TYPE" = "" ]; then
    #get target type (fill in target_name)
    get_target_type

    if [ $? -ne 0 ];then
	target_name=""
    fi
else
    target_name="$TARGET_TYPE"
fi

export TEST_TARGET=$test_target
export TEST_MNT=$test_mnt
export TEST_TMP=$test_tmp
export TEST_DEBUG_FS=$test_debug_fs
export TARGET_TYPE=$target_name
