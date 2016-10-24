Usage: pmem_test [OPTIONS] [TEST_TYPE]...
Runs the tests specified by the TEST_TYPE parameters.
If no TEST_TYPE is specified, then the release test is run.

OPTIONS can be:
  -v, --verbose         run with debug messages on

TEST_TYPE can be:
  -n, --nominal         run standard functionality tests
  -a, --adversarial     run tests that try to break the driver
  -s, --stress          run tests that try to maximize the capacity of the driver
  -r, --release         run one iteration of the nominal, adversarial and stress tests
  -p, --repeatability   run 10 iterations of both the nominal and adversarial tests
  -h, --help            print this help message and exit

TEST BEHAVIOR:

The pmem unit tests behave like a best effort mechanism. The tests are only run,
if memory is available and can be allocated on the device. Since there is no memory
reservation mechanism, the free memory on a device can be allocated at any time
by any arbitrary process, before the unit tests can grab it.

Such a failure can occur on any of the following conditions:

	(A) if ALLORNOTHING allocator is used utmost only one process can
	    allocate memory from the device.
	(B) if entire device size is being used by a start-up process like
	    Surface Flinger, there would be no memory for unit-tests.
	(C) A different process can grab the memory in the race before the
	    unit-tests. This scenario is not common in CI or preflight.
