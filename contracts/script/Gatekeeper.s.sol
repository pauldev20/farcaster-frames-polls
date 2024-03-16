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
        gatekeeper = SignUpWorldcoinGatekeeper(0xDd34A8E7345E7D398Fc618421AF57c6812b76bBd);
        maci = address(0x4a5cd58b24e3BF04360B06bFEaF45A39aA8035b6);
        console.log(address(this));
    }

    function run() public {
        vm.broadcast();
        gatekeeper.setMaciInstance(maci);
    }
}
