# 
# Created by LiuWei @ 2010.8.27 
# init firewall
#

#FMT_ECHO=1>/dev/null 2>&1

ZTE_FILTER_CHAIN=macipport_filter
ZTE_FORWARD_CHAIN=port_forward
ZTE_DMZ_CHAIN=DMZ
ZTE_MAP_CHAIN=port_map

#clear filter
iptables -t filter -F
iptables -t filter -X $ZTE_FILTER_CHAIN

iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD ACCEPT

#clear nat
iptables -t nat -F
iptables -t nat -X $ZTE_FORWARD_CHAIN
iptables -t nat -X $ZTE_DMZ_CHAIN
iptables -t nat -X $ZTE_MAP_CHAIN

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

#Make a new chain for nat
iptables -t nat -N $ZTE_FORWARD_CHAIN
iptables -t nat -N $ZTE_DMZ_CHAIN
iptables -t nat -N $ZTE_MAP_CHAIN

iptables -t nat -I PREROUTING 1 -j $ZTE_FORWARD_CHAIN
iptables -t nat -I PREROUTING 1 -j $ZTE_DMZ_CHAIN
iptables -t nat -I PREROUTING 1 -j $ZTE_MAP_CHAIN


echo "firewall init done"
#nat.sh




