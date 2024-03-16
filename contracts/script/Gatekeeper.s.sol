// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SignUpWorldcoinGatekeeper} from "../src/SignUpWorldcoinGatekeeper.sol";

contract DeployGatekeeper is Script {
    function setUp() public {
    }

    function run() public {
        address owner = address(this);
        address worldId = 0x42FF98C4E85212a5D31358ACbFe76a621b50fC02;
        string memory appId = "app_staging_7d78419cadc0289c378a0c834179fcc7";
        string memory action = "test";
        vm.broadcast();
        SignUpWorldcoinGatekeeper gatekeeper = new SignUpWorldcoinGatekeeper(owner, worldId, appId, action);
        console.log(address(gatekeeper));
    }
}

contract SetMaciGatekeeper is Script {
    SignUpWorldcoinGatekeeper gatekeeper;
    address maci;

    function setUp() public {
        gatekeeper = SignUpWorldcoinGatekeeper(0x34A1D3fff3958843C43aD80F30b94c510645C316);
        maci = address(0x1337);
    }

    function run() public {
        vm.broadcast();
        gatekeeper.setMaciInstance(maci);
    }
}
