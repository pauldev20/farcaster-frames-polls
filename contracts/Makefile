RPC="https://sepolia.base.org"

none:

deploy-gatekeeper:
	forge script DeployGatekeeper --fork-url ${RPC}
set-maci-gatekeeper:
	forge script SetMaciGatekeeper --fork-url ${RPC}


test-gatekeeper:
	forge test --match-test "testGatekeeper" --fork-url ${RPC} -vvvv
test-worldcoin:
	forge test --match-test "testVerification" --fork-url ${RPC} -vvvv
test-nesting:
	forge test --match-test "testNesting" --fork-url ${RPC} -vvvv

.PHONY: test
