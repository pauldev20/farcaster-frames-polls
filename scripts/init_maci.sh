BLUE='\e[0;34m'
RESET='\e[0m'

CLI_DIR='../../votelik/maci/cli'
cd $CLI_DIR

echo "$BLUE DeployingVkRegistry $RESET"
node build/ts/index.js deployVkRegistry

echo "$BLUE setVerifyingKeys $RESET"
node build/ts/index.js setVerifyingKeys \
    --state-tree-depth 10 \
    --int-state-tree-depth 1 \
    --msg-tree-depth 2 \
    --vote-option-tree-depth 2 \
    --msg-batch-depth 1 \
    --process-messages-zkey ./zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey \
    --tally-votes-zkey ./zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey

echo "$BLUE create MACI $RESET"
node build/ts/index.js create -s 10