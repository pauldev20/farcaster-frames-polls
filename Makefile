RPC="https://sepolia.base.org"

test:
	forge test --fork-url ${RPC} -vvvv

test-worldcoin:
	forge test --match-test "testVerification" --fork-url ${RPC} -vvvv

test-nesting:
	forge test --match-test "testNesting" --fork-url ${RPC} -vvvv

.PHONY: test
