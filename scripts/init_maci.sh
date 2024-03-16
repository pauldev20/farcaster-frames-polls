BLUE='\e[0;34m'
RESET='\e[0m'

# gatekeeper=0xDd34A8E7345E7D398Fc618421AF57c6812b76bBd
gatekeeper=$1

if [ -z "$1" ]; then
    echo "Missing gatekeeper parameter. usage: sh init_maci.sh [gatekeeper_address]"
    exit
fi

CLI_DIR='../../votelik/maci/cli'
cd $CLI_DIR

# echo "$BLUE DeployingVkRegistry $RESET"
# node build/ts/index.js deployVkRegistry
    # --rpc-provider https://sepolia.drpc.org

# echo "$BLUE setVerifyingKeys $RESET"
# node build/ts/index.js setVerifyingKeys \
#     --state-tree-depth 10 \
#     --int-state-tree-depth 1 \
#     --msg-tree-depth 2 \
#     --vote-option-tree-depth 2 \
#     --msg-batch-depth 1 \
#     --vk-registry 0x7bB04d019D768f47dDe5CA0D78c9Fbd011F02788 \
#     --process-messages-zkey ./zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey \
#     --tally-votes-zkey ./zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey

echo "$BLUE create MACI $RESET"
node build/ts/index.js create -s 10 \
    --signupGatekeeperAddress $gatekeeper