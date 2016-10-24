#!/system/bin/busybox sh
# ===========================================================
# usb0_2_bridge.sh
# create by zhangyuelong10100551 2012.6.26

echo "usb0_2_bridge.sh.sh: start..."

# Good, in Win8 MBIM lan mode, i am alone, no one will call me.
# So, i don't care about Win8 MBIM lan mode, leave it to bridge_setup.sh

# God, in usb0_2_bridge.sh, zte_nvc_apps r product_tpye is empty
# when pc sleep and wake up! Then the sh will go as default and setup
# the bridge.
#  So we need to creat a file flag to point out the product type, then
#  the sh will do right things.
# "/tmp/product_type_by_router"

FILE_FLAG_PRODUCT_TYPE='/tmp/product_type_by_router'
# here we check if datacard(nat) mode
product_type=`cat $FILE_FLAG_PRODUCT_TYPE`

# only data card mode
if [ "ONLY_DATA_CARD" = "$product_type" ]
then
  echo "usb0_2_bridge.sh: $product_type only data card mode, exit"
  exit
else
  echo "usb0_2_bridge.sh: $product_type will check product type further"
fi

# datacard(nat), just setup usb0
if [ "NO_DRIVER_DATA_CARD" = "$product_type" -o "DRIVER_DATA_CARD" = "$product_type" ]
then
  echo "usb0_2_bridge.sh: $product_type host(less) datacard, just setup usb0"
  usb_ipaddr=`zte_nvc_apps read lan_ipaddr_for_current`
  #no need to set up mask, just 255.255.255.0 is ok
  busybox ifconfig usb0 $usb_ipaddr up
  
  #added by liuweipeng for ipv6 radish start when usb0 is not in bridge 20130130 begin
  radish -i rmnet1 -x -i usb0 -x &
  #added by liuweipeng for ipv6 radish start when usb0 is not in bridge 20130130 end
  
  exit
else
  echo "usb0_2_bridge.sh: need set br0, just go"
fi

# here we setup br0, and add usb0 to br0
if [ -d "/sys/class/net/br0" ]
then
  echo "usb0_2_bridge.sh: br0 exist ..."
else
  echo "usb0_2_bridge.sh: setup br0 ..."
  busybox brctl addbr br0
fi

echo "usb0_2_bridge.sh: ifup usb0 iface  ..."
busybox ifconfig usb0 up
echo "usb0_2_bridge.sh: add usb0 to bridge ..."
busybox brctl addif br0 usb0
# clear usb0 ip empty
busybox ifconfig usb0 0.0.0.0
lan_ipaddr=`zte_nvc_apps read lan_ipaddr_for_current`
lan_netmask_current=`zte_nvc_apps read lan_netmask_for_current`
if [ "" = "$lan_netmask_current" ]
then
  lan_netmask_current='255.255.255.0'
  echo "lan_netmask_current is empty, setnormal [$lan_netmask]"
fi
echo "usb0_2_bridge.sh: here bridge get lan ip is $lan_ipaddr"
busybox ifconfig br0 $lan_ipaddr netmask $lan_netmask_current up
echo "usb0_2_bridge.sh: done ..."
# =============================================================
