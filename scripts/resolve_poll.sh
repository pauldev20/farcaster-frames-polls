#!/bin/bash

# setup

BLUE='\e[0;34m'
RESET='\e[0m'

POLL_ID=$1

if [ -z "$1" ]; then
    echo "Missing poll id parameter. usage: sh resolve_poll.sh [poll_id]"
    exit
fi

CLI_DIR='../../votelik/maci/cli'
cd $CLI_DIR

# seed=ce29af1e23aaceb1eb00721501ae7c42f56171da641346da19bd813b76d67c08
voter_pub=macipk.1e03ee6ec5ee1d0dd9bcc5c91c10df8f2e37e134d9737a0239b361cd2809ae9e
voter_priv=macisk.a87fbc475cf8e42231a6dd487b41ccc935e7d2de08565f1ba6ecd7464694b85e

coord_pub=macipk.398a064125bfa6572b9fac45e9157546fb61df9aa9b721c2e8da32b07abf83a7
coord_priv=macisk.e6f574787e05b5d7622e8b648be71bfc2120ba6230e107e1e581a698791335be


node build/ts/index.js timeTravel -s 1001

# resolving
echo "$BLUE merging signups and messages... $RESET"
node build/ts/index.js mergeSignups -o $POLL_ID \
node build/ts/index.js mergeMessages -o $POLL_ID \

# echo "$BLUE genLocalState $RESET"
# node build/ts/index.js genLocalState \
#     --poll-id 0 \
#     --output localState.json \
#     --privkey macisk.e6f574787e05b5d7622e8b648be71bfc2120ba6230e107e1e581a698791335be \
#     --blocks-per-batch 50


# proof generation locally without quadratic voting
# echo "$BLUE genProofs $RESET"
# node build/ts/index.js genProofs \
#     --privkey macisk.e6f574787e05b5d7622e8b648be71bfc2120ba6230e107e1e581a698791335be \
#     --poll-id 0 \
#     --rapidsnark ~/rapidsnark/build/prover \
#     --process-witnessgen ./zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_cpp/ProcessMessages_10-2-1-2_test \
#     --tally-witnessgen ./zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_cpp/TallyVotes_10-1-2_test \
#     --process-zkey /zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey \
#     --tally-zkey ./zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey \
#     --tally-file tally.json \
#     --output proofs/ \
#     --state-file localState.json \
#     -uq false

# proof generation
echo "$BLUE genProofs $RESET"
node build/ts/index.js genProofs \
    -sk $coord_priv \
    --poll-id $POLL_ID \
    --process-zkey ./zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey \
    --tally-zkey ./zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey \
    --tally-file tally.json \
    --output proofs/ \
    -tw ./zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test_js/TallyVotes_10-1-2_test.wasm \
    -pw ./zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_js/ProcessMessages_10-2-1-2_test.wasm \
    -w true \

echo "$BLUE proveOnChain $RESET"
node build/ts/index.js proveOnChain \
    -o $POLL_ID \
    -f proofs/

echo "$BLUE verify $RESET"
node build/ts/index.js verify \
    -o $POLL_ID \
    -t tally.json
