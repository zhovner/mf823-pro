#!/bin/sh
echo "Socinfo test starting"

cd /sys/devices/system/soc/soc0

echo "Looking for build_id"
C=`find |grep build_id |wc -l`

if [ "$C" == "0" ]
then
	echo "Could not find build_id"
	echo "Test failed."
	exit 1
fi

echo "Looking for id"
C=`find |grep id |wc -l`

if [ "$C" == "0" ]
then
	echo "Could not find id"
	echo "Test failed."
	exit 1
fi

echo "Looking for version"
C=`find |grep version |wc -l`

if [ "$C" == "0" ]
then
	echo "Could not find version"
	echo "Test failed."
	exit 1
fi


echo "Checking that ID is not 'unknown'"
C=`cat id`

if [ "$C" == "0" ]
then
	echo "CPU type is 'unknown'!"
	echo "Test failed."
	exit 1
fi

echo "Socinfo test passed."
