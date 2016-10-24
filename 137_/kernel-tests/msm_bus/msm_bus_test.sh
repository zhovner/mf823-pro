
. $TEST_ENV_SETUP

MSM_BUS_MODULE=msm_bus_ioctl

if [ $TEST_TARGET == "ANDROID" ]; then
	MODULE_LOC="/system/lib/modules"
else
	MODULE_LOC="/modules/lib/modules/*/extra"
fi

export MODULE_EXIST=`lsmod | grep $MSM_BUS_MODULE | cut -d " " -f1`

if [ "$MODULE_EXIST" = "" ]; then
	insmod $MODULE_LOC/$MSM_BUS_MODULE".ko"
	if [ $? -ne 0 ]; then
		echo "ERROR: failed to load module $MSM_BUS_MODULE.ko"
		exit 1
	fi
fi

CMD_LINE="$@"

#invoke test
./msm_bus_test $CMD_LINE
ret=`echo $?`

if [ "$MODULE_EXIST" = "" ]; then
        rmmod $MSM_BUS_MODULE
fi

if [ $ret = "0" ]; then
        echo "Test Passed"
else
        echo "Test Failed"
fi

exit $ret
