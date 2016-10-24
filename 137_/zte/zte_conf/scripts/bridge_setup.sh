#!/system/bin/busybox sh
# ===========================================================
# bridge_setup.sh
# create by zhangyuelong10100551 2012.5.2

# in MBIM lan mode, ndis need a static route rule to access webserver.
# in fact, NDIS can access webServer, but data from webserver to ndis dropped.
#   NDIS  -------------> webServer   Good
#   NDIS  <------X------ webServer   Failed with out static route rule
add_static_route_for_Q6 () {
    # here we setup br0, just give it IP
    # because in hostless datacard mode, websever in a5, need an IP.
    if [ -d "/sys/class/net/br0" ]
    then
      echo "bridge_setup.sh: win8_check br0 exist ..."
    else
      echo "bridge_setup.sh: win8_check setup br0 ..."
      busybox brctl addbr br0
    fi
    # add a static route for NDIS/MBIM on Q6
    echo "bridge_setup:add a route for NDIS/MBIM on Q6"
    gate_way_now=`zte_nvc_apps read lan_ipaddr_for_current`
    lan_netmask_now=`zte_nvc_apps read lan_netmask_for_current`
    busybox ifconfig br0 $gate_way_now netmask $lan_netmask_now up

    # 192.168.0.1 to ip_prifx=192.168.0
    ip_prifx=${gate_way_now%*.*}

    # to 168.0.1
    ndis_pc_ip_addr_end=${gate_way_now#*.*}
    # make to 0.1
    ndis_pc_ip_addr_end=${ndis_pc_ip_addr_end#*.*}
    # make to 1
    ndis_pc_ip_addr_end=${ndis_pc_ip_addr_end#*.*}
    echo "ndis_pc_ip_addr_end "$ndis_pc_ip_addr_end

    # rmnet0=gw+1, ndis ip=gw+3
    let rmnet0_ip_addr_end=$ndis_pc_ip_addr_end+1
    let ndis_pc_ip_addr_end=$ndis_pc_ip_addr_end+3
    ndis_pc_ip_addr="${ip_prifx}"'.'"$ndis_pc_ip_addr_end"
    rmnet0_ip_addr="${ip_prifx}"'.'"$rmnet0_ip_addr_end"
    echo "bridge_setup.sh: NDIS/MBIM on PC from Q6 ip is ["$ndis_pc_ip_addr"]"
    echo "bridge_setup.sh: rmnet0 ip is ["$rmnet0_ip_addr"]"

    # route add -host 192.168.32.4 gw 192.168.32.2 dev rmnet0
    route add -host $ndis_pc_ip_addr gw $rmnet0_ip_addr dev rmnet0
}

# win8 check, in file win8mbim, 0-not win8 mode, 1-win8 wan mode, 2-win8 lan mode.
win8_check () {
    if [ x`cat /sys/class/android_usb/android0/win8mbim` = x"2" ]; then
      echo "win8 in lan mode"
      add_static_route_for_Q6
    else
    # in internet ip mode, no router running, so this sh will not be called.
      echo "not win8 or internet ip mode"
    fi    
}

mod_dss='dss'
ppp_mod=`zte_nvc_apps read ppp_dial_method`
if [ "$mod_dss" = "$ppp_mod" ]
then
  echo "bridge_setup.sh: good, mode[$ppp_mod]"
else
  echo "bridge_setup.sh: not dss mode, maybe sap!"
#  exit
fi

# here we check if datacard(nat) mode
product_type=`zte_nvc_apps read product_type`

# God, in usb0_2_bridge.sh, zte_nvc_apps r product_tpye is empty
# when pc sleep and wake up! Then the sh will go as default and setup
# the bridge.
#  So we need to creat a file flag to point out the product type, then
#  the sh will do right things.
# "/tmp/product_type_by_router"

FILE_FLAG_PRODUCT_TYPE='/tmp/product_type_by_router'
echo $product_type > $FILE_FLAG_PRODUCT_TYPE

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
  usb_ipaddr=`zte_nvc_apps read lan_ipaddr_for_current`
  #no need to set up mask, just 255.255.255.0 is ok
  busybox ifconfig usb0 $usb_ipaddr up
  win8_check
  
  #added by liuweipeng for ipv6 radish start when usb0 is not in bridge 20130130 begin
  radish -i rmnet1 -x -i usb0 -x > /dev/null &
  #added by liuweipeng for ipv6 radish start when usb0 is not in bridge 20130130 end
  
  exit
else
  echo "bridge_setup.sh: need set br0, just go"
fi

# here we setup br0, and add eth0 usb0 to br0
if [ -d "/sys/class/net/br0" ]
then
  echo "bridge_setup.sh: br0 exist ..."
else
  echo "bridge_setup.sh: setup br0 ..."
  busybox brctl addbr br0
fi

station_mod=$1

ap_stat_mod='apsta'
if_sta=`zte_nvc_apps read wifi_sta_net`
if_ap=`zte_nvc_apps read wifi_ap_net`
if_map='wl0.1'
cur_mod=`zte_nvc_apps read apsta_type`
echo "bridge_setup.sh: cur_mod[$cur_mod], if_ap[$if_ap], if_map[$if_map]..."

echo "bridge_setup.sh: ifup iface  ..."
busybox ifconfig usb0 up
if [ "bridge" = "$station_mod" ]
then
  busybox ifconfig $if_sta up
else
  echo "bridge_setup.sh: router mod, no[$if_sta] up "
fi
busybox ifconfig $if_ap up
if [ "$ap_stat_mod" = "$cur_mod" ]
then
  echo "bridge_setup.sh: apsta mod, no up if_map"
else
  busybox ifconfig $if_map up
fi

echo "bridge_setup.sh: del/add eth0 usb0 from/to bridge ..."
busybox brctl addif br0 usb0
if [ "bridge" = "$station_mod" ]
then
  busybox brctl addif br0 $if_sta
else
  echo "bridge_setup.sh: router mod, del[$if_sta] from bridge "
  busybox brctl delif br0 $if_sta
fi

if [ "$ap_stat_mod" = "$cur_mod" ]
then
  echo "bridge_setup.sh: apsta mod, del if_map from bridge "
  busybox brctl delif br0 $if_map
else
  busybox brctl addif br0 $if_map
fi
busybox brctl addif br0 $if_ap

# set eth0 empty, set eth0's ip to br0
busybox ifconfig usb0 0.0.0.0
if [ "bridge" = "$station_mod" ]
then
  busybox ifconfig $if_sta 0.0.0.0
else
  echo "bridge_setup.sh: router mod, no[$if_sta] "
fi
busybox ifconfig $if_ap 0.0.0.0
if [ "$ap_stat_mod" = "$cur_mod" ]
then
  echo "bridge_setup.sh: apsta mod, no if_map"
else
  busybox ifconfig $if_map 0.0.0.0
fi

lan_ipaddr=`zte_nvc_apps read lan_ipaddr_for_current`
lan_netmask_current=`zte_nvc_apps read lan_netmask_for_current`
if [ "" = "$lan_netmask_current" ]
then
  lan_netmask_current='255.255.255.0'
  echo "lan_netmask_current is empty, setnormal [$lan_netmask]"
fi
echo "bridge_setup.sh: here bridge get lan ip is $lan_ipaddr"
busybox ifconfig br0 $lan_ipaddr netmask $lan_netmask_current up
# check if win8 now again, maybe ufi need MBIM?
win8_check
echo "bridge_setup.sh: done ..."
# =============================================================
