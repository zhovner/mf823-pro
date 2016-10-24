if [ -f /etc/miniupnpd/miniupnpd.conf ]
	then
		echo "miniupnpd.conf exists!"
	else
		echo "miniupnpd.conf does not exist, exit!"
		exit
fi

conf_file="/etc/miniupnpd/miniupnpd.conf"

ext_ifname=$(grep ext_ifname= $conf_file)
aim="ext_ifname=$1"
sed -i "s:$ext_ifname:$aim:g" $conf_file
