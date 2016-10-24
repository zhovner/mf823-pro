#!/bin/sh

delta_path="/cache/zte_fota/delta"
mnt_path="/cache/zte_fota/delta/mnt"
disk_path="/cache/zte_fota/delta/disk"
switch_path="/sys/class/android_usb/android0/f_mass_storage/lun0/file"

if [ ! -d "$delta_path" ]; then
	mkdir -p "$delta_path"
fi

if [ ! -d "$mnt_path" ]; then
	mkdir -p "$mnt_path"
fi

if [ ! -f "$disk_path" ]; then
	dd if=/dev/zero of="$disk_path" bs=1M count=26
	mkfs.vfat "$disk_path"
fi

echo 3 > /proc/sys/vm/drop_caches
mount -t vfat "$disk_path" "$mnt_path"
sleep 5
echo OK > "$mnt_path"/flag 
rm -rf "$mnt_path"/ready

umount "$mnt_path"
sleep 1
echo 3 > /proc/sys/vm/drop_caches
echo "$disk_path" > "$switch_path"

