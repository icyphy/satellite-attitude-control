#!/bin/bash

# Change the working directory to the directory of the script.
cd "$(dirname "$0")"

# Compile the reaction wheel program.
lfc-dev -c -n ../src/ReactionWheel.lf

# Remove the existing reaction wheel directory
ssh agent-k@192.168.3.4 'rm -rf ~/ReactionWheel'

# Scp the new src-gen folder
scp -r ../src-gen/ReactionWheel agent-k@192.168.3.4:~

# Build ReactionWheel
ssh agent-k@192.168.3.4 'cd ~/ReactionWheel && mkdir build && cd build && cmake .. && make'
