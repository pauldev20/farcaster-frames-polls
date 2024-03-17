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

echo "$BLUE create MACI $RESET"
node build/ts/index.js create -s 10 \
    --signupGatekeeperAddress $gatekeeper \
    --use-quadratic-voting false