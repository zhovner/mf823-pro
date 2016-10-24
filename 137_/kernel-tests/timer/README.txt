	Timer Testing Documentation

Usage: timertest.sh (no arguments)
Runs the basic timer test

OPTIONS:
  (none)

TEST BEHAVIOR:
	* Verify (in a user-assisted manner) the timer tick rate is correct

TARGETS:
	* All targets

NOTES:
This test cannot be run in an automated way, as it requires and external user
to determine if we slept for the correct amount of time.
