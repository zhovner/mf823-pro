#!/bin/sh
#=====================================================
#set_dns_resolv.sh
#create by hebin10099125 2012.05.15
#modify by zhangyuelong10100551
DNS_RESOLV_FILE="/etc/resolv.conf"
DNS_RESOLV_FILE_PPP="/etc/resolv.conf-ppp"
route_wifi_flag="/tmp/route_wifi.flag"
   
   
echo "" > $DNS_RESOLV_FILE_PPP

# ipv4 dns set
dnsmode=`zte_nvc_apps read dns_mode`
if [ "$dnsmode" = "auto" ] ; then
    echo "auto dnsmode"
    dns1=`zte_nvc_apps read prefer_dns_auto`
    if [ -n "$dns1" ];then
    	echo "nameserver" $dns1 >> $DNS_RESOLV_FILE_PPP
    fi
 
    dns2=`zte_nvc_apps read standby_dns_auto`
    if [ -n "$dns2" ];then
    	echo "nameserver" $dns2 >> $DNS_RESOLV_FILE_PPP
    fi
fi

if [ "$dnsmode" = "manual" ] ; then
    echo "manual dns mode"
    
    dns1=`zte_nvc_apps read prefer_dns_manual`
    if [ -n "$dns1" ];then
    	echo "nameserver" $dns1 >> $DNS_RESOLV_FILE_PPP
    fi
    
    dns2=`zte_nvc_apps read standby_dns_manual`
    if [ -n "$dns2" ];then
    	echo "nameserver" $dns2 >> $DNS_RESOLV_FILE_PPP
    fi
fi

 # ipv6 dns set
ipv6_dns_mode=`zte_nvc_apps read ipv6_dns_mode`
echo "ipv6_dns_mode: $ipv6_dns_mode"
    
if [ "$ipv6_dns_mode" = "auto" ];then

	ipv6_prefer_dns_auto=`zte_nvc_apps read ipv6_prefer_dns_auto`
	ipv6_standby_dns_auto=`zte_nvc_apps read ipv6_standby_dns_auto`
				
		if [ -n "$ipv6_prefer_dns_auto" ]&& [ "$ipv6_prefer_dns_auto" != "::" ];then
			echo nameserver $ipv6_prefer_dns_auto >> $DNS_RESOLV_FILE_PPP
		fi
				
	if [ -n "$ipv6_standby_dns_auto" ] && [ "$ipv6_standby_dns_auto" != "::" ];then
		echo nameserver $ipv6_standby_dns_auto >> $DNS_RESOLV_FILE_PPP
	fi
	
elif [ "$ipv6_dns_mode" = "manual" ];then
    
	ipv6_prefer_dns_manual=`zte_nvc_apps read  ipv6_prefer_dns_manual`
	ipv6_standby_dns_manual=`zte_nvc_apps read ipv6_standby_dns_manual`
			
	if [ -n "$ipv6_prefer_dns_manual" ] && [ "$ipv6_prefer_dns_manual" != "::" ];then
		echo nameserver $ipv6_prefer_dns_manual >> $DNS_RESOLV_FILE_PPP
	fi
			
	if [ -n "$ipv6_standby_dns_manual" ] && [ "$ipv6_standby_dns_manual" != "::" ];then
		echo nameserver $ipv6_standby_dns_manual >> $DNS_RESOLV_FILE_PPP 
	fi
			
fi




# if route is on wifi, don't change resolv.conf
if [ -f $route_wifi_flag ]; then
  echo "Router is wifi"
else
  echo "Router is 3G/4G"
  cp -fr $DNS_RESOLV_FILE_PPP $DNS_RESOLV_FILE
fi