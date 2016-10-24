if [ -f /etc/miniupnpd/miniupnpd.conf ]
	then
		echo "miniupnpd.conf exists!"
	else
		echo "miniupnpd.conf does not exist, exit!"
		exit
fi

conf_file="/etc/miniupnpd/miniupnpd.conf"

listening_ip=$(grep listening_ip= $conf_file)
aim="listening_ip=$1"
sed -i "s:$listening_ip:$aim:g" $conf_file
