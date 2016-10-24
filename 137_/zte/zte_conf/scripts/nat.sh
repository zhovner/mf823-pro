#!/bin/sh
#
# $Id: nat.sh,v 1.1 2007-09-26 01:33:21 winfred Exp $
#
# usage: nat.sh
# just for rmnet0 up call

if_dss_wan='rmnet0'
wan_if=$if_dss_wan

ppp_mod=`zte_nvc_apps read ppp_dial_method`
if [ "dss" = "$ppp_mod" ]
then
  echo "nat.sh: good, mode[$ppp_mod]"
else
  echo "nat.sh: not dss mode, exit!"
  exit
fi

cur_mod=`zte_nvc_apps read apsta_type`
sta_if_connect=`zte_nvc_apps read ex_wifi_status`
if [ "$ap_stat_mod" = "$cur_mod" ]
then
  echo "nat.sh: apsta mod"
  if [ "connect" = "$sta_if_connect" ]
  then
      echo "nat.sh: now station is wan, exit"
      exit
  else
      echo "nat.sh use $wan_if as wan and default gw"
  fi
else
  echo "nat.sh use $wan_if as wan and default gw"
fi

echo 1 > /proc/sys/net/ipv4/ip_forward

iptables -t nat -D POSTROUTING 1
iptables -t nat -A POSTROUTING -o $wan_if -j MASQUERADE
ip route del default
ip route del default
ip route del default
ip route del default
ip route add default dev $wan_if
