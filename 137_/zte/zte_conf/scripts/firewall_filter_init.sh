# 
# Created by LiuWei @ 2010.8.27 
# init firewall
#

#FMT_ECHO=1>/dev/null 2>&1

ZTE_FILTER_CHAIN=macipport_filter

#clear filter
iptables -t filter -F
iptables -t filter -X $ZTE_FILTER_CHAIN

iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD ACCEPT

#make a new chain for filter
iptables -t filter -N $ZTE_FILTER_CHAIN
iptables -t filter -A FORWARD -j $ZTE_FILTER_CHAIN

# begin - zhangyuelong10100551 for ipv6 firewall 2012.08.30
#clear filter
ip6tables -t filter -F
ip6tables -t filter -X $ZTE_FILTER_CHAIN

ip6tables -P INPUT ACCEPT
ip6tables -P OUTPUT ACCEPT
ip6tables -P FORWARD ACCEPT

ip6tables -t filter -N $ZTE_FILTER_CHAIN
ip6tables -t filter -A FORWARD -j $ZTE_FILTER_CHAIN
# end - zhangyuelong10100551 for ipv6 firewall 2012.08.30

# here set mtu, tcpmss=mtu-40
tcp_mss=`zte_nvc_apps read tcp_mss`
wan='rmnet0'
wan_v6='rmnet1'
if [ "" = "$tcp_mss" ]
then
  echo "no tcpmss set"
else
  #iptables -t mangle -A POSTROUTING -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss $tcp_mss
  let mtu_size=$tcp_mss+40
  ifconfig $wan mtu $mtu_size
  ifconfig $wan_v6 mtu $mtu_size
  echo "tcpmss set $tcp_mss"
fi

echo "firewall init done"
#nat.sh




