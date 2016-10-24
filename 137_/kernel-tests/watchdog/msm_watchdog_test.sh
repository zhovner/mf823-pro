
ANDROID_MODULE="/system/lib/modules/msm_watchdog_test_module.ko"
KDEV_MODULE="/modules/lib/modules/*/extra/msm_watchdog_test_module.ko"

if [ -e $ANDROID_MODULE ]
then
	insmod $ANDROID_MODULE
fi
for file in $KDEV_MODULE
do
	if [ -e ${file} ]
	then
		insmod ${file}
	fi
done
echo "Test failed"
exit 1
