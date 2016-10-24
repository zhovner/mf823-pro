#!/bin/sh

delta_path="/cache/zte_fota/delta"
mnt_path="/cache/zte_fota/delta/mnt"
disk_path="/cache/zte_fota/delta/disk"

if [ ! -d "$delta_path" ]; then
	exit
fi

if [ ! -f "$disk_path" ]; then
	exit
fi

if [ ! -d "$mnt_path" ]; then
	exit
fi

umount "$mnt_path"
sleep 2
mount -t vfat "$disk_path" "$mnt_path" &
echo 3 > /proc/sys/vm/drop_caches
sleep 5
rm -f "$mnt_path"/flag
touch "$mnt_path"/ready
rm -rf /cache/zte_fota/log


