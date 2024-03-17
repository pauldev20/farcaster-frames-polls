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
    --process-messages-zkey ./zkeys/ProcessMessagesNonQv_10-2-1-2_test/ProcessMessagesNonQv_10-2-1-2_test.0.zkey \
    --tally-votes-zkey ./zkeys/TallyVotesNonQv_10-1-2_test/TallyVotesNonQv_10-1-2_test.0.zkey
