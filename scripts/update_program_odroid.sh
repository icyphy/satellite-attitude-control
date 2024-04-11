#!/bin/bash

# ip=192.168.3.2      # Under macOS's internet sharing
ip=192.168.123.111  # Under DHCP from CuteRouter
username=nkagamihara
program=DataProcessing

# Change the working directory to the directory of the script.
cd "$(dirname "$0")"

# Compile the reaction wheel program.
lfc-dev -c -n ../src/$program.lf

# Remove the existing reaction wheel directory
program=${program:?Variable not set or empty}
echo "ssh $username@$ip 'rm -rf ~/$program'"
ssh $username@$ip "rm -rf ~/$program"

# Scp the new src-gen folder
scp -r "../src-gen/$program" "$username@$ip:~"

# Build
ssh $username@$ip "cd ~/$program && mkdir build && cd build && cmake .. && make"
