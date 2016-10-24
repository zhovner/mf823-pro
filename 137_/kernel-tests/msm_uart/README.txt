
Test: MSM Uart Unit Test

Usage: msm_uart_test [-n] [-e] [-l] [--port <port_num>]
where
-n Nominal Test (Simple Test; Default Test)
-e Echo Test
-l Loopback Test
--port n Test UARTn, n=1,2,3; Test HSL0, n=4; (default is UART1)

e.g. ./msm_uart_test -n --port 3

If no argument is provided, Nominal Test will be run on UART1

Another test script wrapper msm_uart_test.sh is provided as well which
can be used to auto-detect the port num if it is not provided by user.

Usage: ./msm_uart_test.sh [-n] [-e] [-l] [--port <port_num>]

The options are the same as those for the test app msm_uart_test.sh. Difference
is that if no --port is provided, the script will try to auto-detect the port num
based on the target type.

Description:
This directory contains basic tests for the legacy UART driver (msm_uart).
The code supports 3 different tests for UART[1-3] devices and HSL0. Below
describes the 3 different tests.

1. Nominal (Simple) - This test verifies that you can open port configure it and then
sends data out the device. It does not try to verify that the data send was
correct.

2. Echo - This test opens the device at 115200 and then loop backs the data
read out the device. It loops untill the user types control-C. The PC/Client
needs to send the data to the device and then verify that the data returned is
correct. (Used with UART Tester setup)

3. Loop back - This test requires that a loop back is connected externally to 
the UART device being tested. It then will write data out the device and read 
the data back to verify it got the correct. Loop back connection requires 
pin 2(Transmit) and pin 3(Receive) connected and pin 7 (RTS-request to send) 
and pin 8 (CTS-clear to send) connected. 
 
If a console or any other user application is already running on the UART port
then test 2 and test 3 will Fail.

Targets:
7X27, 7X30, 8650, 8660, 8960

Notes:
1) On Android adb shell, busybox installation is required for test to run.
2) For 8660 and 8960, /dev/ttyHSL0 is used as console UART and the corresponding port num
   is 4.
3) Since Echo and Loopback test require manual interaction, they can't be
   used in automation test.


Test: Probe/detection test for ttyMSM0

Usage: probe_test.sh (no arguments)
Runs the very basic serial console test

Options:
  (none)

Test Behavior:
	* Verify that ttyMSM0 is present in sysfs

Targets:
	* 8960 Virtio / RUMI, upstream only
	* 8660 silicon, upstream only

Notes:
1) Failures can occur due to incorrect platform data for the serial device,
missing Kconfig options to enable the serial driver, or due to a
missing/incorrect clock configuration which prevents the serial driver from
probing.

2) The test is currently expected to pass on 8960 upstream targets, but is known
to fail on 8660 due to lack of serial support (which is due to lack of clocks).
The test will fail on mainline targets because they are still using the old
msm_serial_hsl driver, which needs to be merged into msm_serial the same way
as it was done on upstream.
