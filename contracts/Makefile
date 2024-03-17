RPC="https://base-sepolia.g.alchemy.com/v2/xC7gy-WyxYdV48GlxEyP4n6xuVfYRTK3"

include .env
export

none:

deploy-gatekeeper:
	forge script DeployGatekeeper --fork-url ${RPC} --broadcast --private-key $(PRIVATE_KEY)
set-maci-gatekeeper:
	forge script SetMaciGatekeeper --fork-url ${RPC} --broadcast --private-key $(PRIVATE_KEY)

test-gatekeeper:
	forge test --match-test "testGatekeeper" --fork-url ${RPC} -vvvv
test-worldcoin:
	forge test --match-test "testVerification" --fork-url ${RPC} -vvvv
test-nesting:
	forge test --match-test "testNesting" --fork-url ${RPC} -vvvv

.PHONY: test
