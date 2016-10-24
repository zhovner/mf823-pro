#-----------------------------------------------------------------------------
# Copyright (c) 2011 QUALCOMM Incorporated.
# All Rights Reserved. QUALCOMM Proprietary and Confidential.
#-----------------------------------------------------------------------------

. $TEST_ENV_SETUP #TARGET_TYPE filled in

echo "CPU test starting"
num_cpus=2

get_num_cpus() {
	case $TARGET_TYPE in
	8660 | 8960)
		num_cpus=2
		;;
	8064 | 8974)
		num_cpus=4
		;;
	*)
		echo "Not able to detect target type"
		num_cpus=2
		;;
	esac
}

get_num_cpus
while [ $# -gt 0 ]; do
	case $1 in
	-c | --cpus)
		num_cpus=$2 ; shift 2
		;;
	-h | --help)
		echo "Usage: $0 [-c <number_of_cpus>]" ;
		exit 1
		;;
	esac
done

echo "Checking number of CPUs"

C=`cat /proc/cpuinfo |grep processor |wc -l`

echo "Detected $C processors."

if [ "$C" != $num_cpus ]
then
	echo "Unexpected number of CPUs, expected = $num_cpus."
	echo "Test failed."
	exit 1
fi


echo "Checking for ARMv7"
C=`cat /proc/cpuinfo |grep ARMv7 |wc -l`

if [ "$C" != "1" ]
then
	echo "ARMv7 not detected."
	echo "Test failed."
	exit 1
fi

echo "Test passed."

