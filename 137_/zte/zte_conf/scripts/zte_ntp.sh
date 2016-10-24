#!/bin/sh

sntp_server0=`zte_nvc_apps r sntp_server0`
sntp_server0=${sntp_server0##*=}
sntp_server1=`zte_nvc_apps r sntp_server1`
sntp_server1=${sntp_server1##*=}
sntp_server2=`zte_nvc_apps r sntp_server2`
sntp_server2=${sntp_server2##*=}
if [ "$sntp_server0" != "" ]; then
	opt_server="-h$sntp_server0"
fi
if [ "$sntp_server1" != "" ]; then
	opt_server="$opt_server -j$sntp_server1"
fi
if [ "$sntp_server2" != "" ]; then
	opt_server="$opt_server -k$sntp_server2"
fi
start_ntpclient()
{
	# param: -l means keep runing -s means adjust time
	#make it run in background, or the sh will be hang-up
	#here is the list of all internet ntp server:
	#210.72.145.44 xi'an    192.43.244.18 US    210.0.235.14 HK    59.124.196.84 TW    133.100.11.8 JP¸£¸Ô´óÑ§
	#the order is: -h(must be exist), -j -k -m -m
	#ntpclient -h59.124.196.84 -j192.43.244.18 -k210.0.235.14 -m133.100.11.8 -n210.72.145.44 -i3600 -z$tz -s &
	echo "ntpclient $opt_server -i15 -s &"
	ntpclient $opt_server -i15 -s &
	#add -l params if want keep interval
}

stop_ntpclient()
{
	killall ntpclient 1>/dev/null 2>&1
}

if [ "$1" = "start" ]; then
	start_ntpclient
elif [ "$1" = "stop" ]; then
	stop_ntpclient
elif [ "$1" = "restart" ]; then
	stop_ntpclient
	start_ntpclient
else
	echo "unknow args, you can use: start stop restart"
	exit 1
fi

exit 0
