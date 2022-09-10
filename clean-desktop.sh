#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Clean Desktop
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🗑

# Documentation:
# @raycast.description Clean up that desktop
# @raycast.author Grant Sander

cd ~/Desktop
rm *.{jpg,gif,mp4,png} || true
