ip_addr=$(busybox ifconfig rmnet0 | awk -F "[ :]+" 'NR==2{print $4}')
zte_nvc_apps w wan_ipaddr $ip_addr
echo "wan_ipaddr :$ip_addr"
dns1=$(busybox cat /etc/resolv.conf | awk 'NR==1{print $2}')
zte_nvc_apps w prefer_dns_auto $dns1
echo "prefer_dns_auto = $dns1"
dns2=$(busybox cat /etc/resolv.conf | awk 'NR==2{print $2}')
zte_nvc_apps w standby_dns_auto $dns2
echo "standby_dns_auto = $dns2"