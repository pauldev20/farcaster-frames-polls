#!/bin/bash

# setup

BLUE='\e[0;34m'
RESET='\e[0m'

CLI_DIR='../../votelik/maci/cli'
cd $CLI_DIR

# seed=ce29af1e23aaceb1eb00721501ae7c42f56171da641346da19bd813b76d67c08
voter_pub=macipk.1e03ee6ec5ee1d0dd9bcc5c91c10df8f2e37e134d9737a0239b361cd2809ae9e
voter_priv=macisk.a87fbc475cf8e42231a6dd487b41ccc935e7d2de08565f1ba6ecd7464694b85e

coord_pub=macipk.398a064125bfa6572b9fac45e9157546fb61df9aa9b721c2e8da32b07abf83a7
coord_priv=macisk.e6f574787e05b5d7622e8b648be71bfc2120ba6230e107e1e581a698791335be

node ./build/ts/index.js deployPoll \
    -pk $coord_pub \
    -t 100 -i 1 -m 2 -b 1 -v 2

# --maci-address 0x10c60c92b24b6bB1Cd620935cc4627C8Fe8cfC3B \