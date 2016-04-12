all: test

test: lint

lint:
	@ find src/js -name "*.js" \
		-not -path "node_modules/*" \
		-print0 | \
		xargs -0 ./node_modules/.bin/eslint
