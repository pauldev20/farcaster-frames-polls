// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IWorldID} from "../lib/world-id-onchain-template/contracts/src/interfaces/IWorldID.sol";
import {Test, console} from "forge-std/Test.sol";
import {ByteHasher} from "../src/ByteHasher.sol";
import {SignUpWorldcoinGatekeeper} from "../src/SignUpWorldcoinGatekeeper.sol";

contract SignUpWorldcoinGatekeeperTest is Test {
    SignUpWorldcoinGatekeeper gatekeeper;

    function setUp() public {
        address owner = address(this);
        address worldId = 0x42FF98C4E85212a5D31358ACbFe76a621b50fC02;
        string memory appId = "app_staging_7d78419cadc0289c378a0c834179fcc7";
        string memory action = "test";
        gatekeeper = new SignUpWorldcoinGatekeeper(owner, worldId, appId, action);
    }

    function testGatekeeper() public {
        // need to pretend to be maci in order to register a user
        gatekeeper.setMaciInstance(address(this));
        bytes memory data = generateData();
        gatekeeper.register(address(0xc01a), data);
        vm.expectRevert(bytes4(keccak256("AlreadyRegistered()")));
        gatekeeper.register(address(0xc01a), data);
    }

    function generateData() public pure returns(bytes memory) {
        address signal = 0x4B4ddb5A02b0B6b14274013d6ba13A3fBd65D5d3;
        uint256 merkle_root = 0x1e28120c18d4a1025fbcbc2401462cfce8406fc87b7c8a0468c474649687df70;
        uint256 nullifierHash = 0x21ea8bf989c364c27b5baf90516fe582b8870c166db90b6a17840a46add5b1e3;
        uint256[8] memory proof;
        proof[0] = 0x056d319a4cafcce6e18df70fe7304dfd96dc4d98fbcca3738651aea79d317c53;
        proof[1] = 0x270b895a890a196bc0aa7435845e0d476f1a528623381b7c8cdd36f42e791f2b;
        proof[2] = 0x1b879e88ff6f1cee7116d71a80e52e0d77b90113b2dd0ddd02a859ddc7cc383a;
        proof[3] = 0x021d81ffb22658f6ca33ca4f5e838f3982e10ee6c86d7876bd8d508247b3c731;
        proof[4] = 0x0674120b44b050db94b3889e896d969baab96730793eada911442d735c04e562;
        proof[5] = 0x124c9b446194b76a66b3509141c0d871200ad3424f8772218a95b396bd5c6ab9;
        proof[6] = 0x05712406a76fd420b14909687ac7a5279ffbb96d7bbb5ec62a3d2734d57e39e8;
        proof[7] = 0x227337049e00603d9817f3b7831da58864eb126ae909db2c63275b772958799c;
        
        bytes memory data = abi.encode(signal, merkle_root, nullifierHash, proof);
        return data;
    }
}
