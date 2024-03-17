// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SignUpWorldcoinGatekeeper} from "../src/SignUpWorldcoinGatekeeper.sol";

contract DeployGatekeeper is Script {
    function setUp() public {
    }

    function run() public {
        address owner = 0xd61091c1051C6d249f0446088C46c8b4A86dF6D7;
        console.log(owner);
        address worldId = 0x42FF98C4E85212a5D31358ACbFe76a621b50fC02;
        string memory appId = "app_staging_e5f6479bc07964d51a5d30595a99a2d5";
        string memory action = "anonymous-vote";
        vm.broadcast();
        SignUpWorldcoinGatekeeper gatekeeper = new SignUpWorldcoinGatekeeper(owner, worldId, appId, action);
        console.log(address(gatekeeper));
    }
}

contract SetMaciGatekeeper is Script {
    SignUpWorldcoinGatekeeper gatekeeper;
    address maci;

    function setUp() public {
        gatekeeper = SignUpWorldcoinGatekeeper(0x2E3301C399DCAd3556e7c36e9a0197dB686bD899);
        maci = address(0x587E495af03FE6C3ec56a98394807c753B827a75);
        console.log(address(this));
    }

    function run() public {
        vm.broadcast();
        gatekeeper.setMaciInstance(maci);
    }
}
