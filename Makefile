CC=gcc
ifeq ($(TRAVIS), true)
CFLAGS=
else
CFLAGS=-std=c11
endif
CINCLUDES=-I tests/include/ -I tests/

TEST_FILES=tests/tests.c
SRC_FILES=
TEST_EXTRAS=tests/src/pebble.c

all: test

test: lint
	@$(CC) $(CFLAGS) $(CINCLUDES) $(TEST_FILES) $(SRC_FILES) $(TEST_EXTRAS) -o tests/run
	@tests/run
	@rm tests/run
	@printf "\x1B[0m"

lint:
	@ find src/js/src -name "*.js" \
		-not -path "src/js/libs/*" \
		-not -path "node_modules/*" \
		-print0 | \
		xargs -0 ./node_modules/.bin/eslint
