#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Resize for Recording
# @raycast.mode compact

# Documentation:
# @raycast.author Grant Sander


tell application "System Events"
	set w to 1960
	set h to 1700
	set l to 2000
	set t to 200
end tell

tell application "System Events" to tell process "Code"
	tell window 1
		set size to {w, h}
		set position to {l, t}
	end tell
end tell

tell application "System Events" to tell process "Chrome"
	tell window 1
		set size to {w, h}
		set position to {l, t}
	end tell
end tell