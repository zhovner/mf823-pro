#!/bin/sh
#
# $Id: upnp.sh,v 1.22.6.1 2008-10-02 12:57:42 winfred Exp $
#
# usage: upnp.sh
#

conf_dir=/etc/miniupnpd
lan_if=br0
wan_if=rmnet0

cur_mod=`zte_nvc_apps read apsta_type`
sta_stutas=`zte_nvc_apps read ex_wifi_status`
gw=`zte_nvc_apps read lan_ipaddr`

# here we check if datacard(nat) mode
product_type=`zte_nvc_apps read product_type`

conf_file="/etc/miniupnpd/miniupnpd.conf"
serial=`zte_nvc_apps read imei`
if [ "$serial" != "" ]
then
  serial_org=$(grep serial= $conf_file)
  aim="serial=$serial"
  sed -i "s:$serial_org:$aim:g" $conf_file
fi

# only data card mode
if [ "ONLY_DATA_CARD" = "$product_type" ]
then
  echo "bridge_setup.sh: $product_type only data card mode, exit"
  exit
else
  echo "bridge_setup.sh: $product_type will check product type further"
fi

# datacard(nat), just setup usb0
if [ "NO_DRIVER_DATA_CARD" = "$product_type" -o "DRIVER_DATA_CARD" = "$product_type" ]
then
  echo "bridge_setup.sh: $product_type host(less) datacard, just setup usb0"
  lan_if=usb0
else
  echo "bridge_setup.sh: need set br0, just go"
fi

# stop all
killall -9 miniupnpd
$conf_dir/iptables_removeall.sh

# upnp starting

if [ -f /var/run/miniupnp.pid ]
then
	rm -f /var/run/miniupnpd.pid
fi

if [ "apsta" = "$cur_mod" -a "connect" = "$sta_stutas" ]; then
	echo "miniupnpd.sh: now station is wan."
	wan_if=`zte_nvc_apps read wifi_sta_net`
fi

#$conf_dir/miniupnpd_extif.sh $wan_if
#$conf_dir/miniupnpd_listenips.sh $gw/16

route add -net 239.0.0.0 netmask 255.0.0.0 dev $lan_if
# route add default gw $gw dev $lan_if
$conf_dir/iptables_init.sh
miniupnpd -f /etc/miniupnpd/miniupnpd.conf -i $wan_if -a $gw/16 &