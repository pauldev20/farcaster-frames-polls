// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IWorldID} from "../lib/world-id-onchain-template/contracts/src/interfaces/IWorldID.sol";
import {Test, console} from "forge-std/Test.sol";
import {ByteHasher} from "../src/ByteHasher.sol";

contract WorldCoinExample is Test {
    using ByteHasher for bytes;
    uint256 internal externalNullifierHash;
    IWorldID internal worldId;
    uint256 internal immutable groupId = 1;

    function setUp() public {
        worldId = IWorldID(0x42FF98C4E85212a5D31358ACbFe76a621b50fC02);
        string memory _appId = "app_staging_7d78419cadc0289c378a0c834179fcc7";
        string memory _action = "test";
        externalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _action)
            .hashToField();
    }

    // "verification_level": "orb",
    // "proof": "0x056d319a4cafcce6e18df70fe7304dfd96dc4d98fbcca3738651aea79d317c53270b895a890a196bc0aa7435845e0d476f1a528623381b7c8cdd36f42e791f2b1b879e88ff6f1cee7116d71a80e52e0d77b90113b2dd0ddd02a859ddc7cc383a021d81ffb22658f6ca33ca4f5e838f3982e10ee6c86d7876bd8d508247b3c7310674120b44b050db94b3889e896d969baab96730793eada911442d735c04e562124c9b446194b76a66b3509141c0d871200ad3424f8772218a95b396bd5c6ab905712406a76fd420b14909687ac7a5279ffbb96d7bbb5ec62a3d2734d57e39e8227337049e00603d9817f3b7831da58864eb126ae909db2c63275b772958799c",
    // "merkle_root": "0x1e28120c18d4a1025fbcbc2401462cfce8406fc87b7c8a0468c474649687df70",
    // "nullifier_hash": "0x21ea8bf989c364c27b5baf90516fe582b8870c166db90b6a17840a46add5b1e3",
    // "credential_type": "orb"

    function testVerification() public view {
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
        
        verifyAndExecute(signal, merkle_root, nullifierHash, proof);
    }

    function testNesting() public view {
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
        console.logBytes(data);
        decodeAndVerify(data);
    }

    function decodeAndVerify(bytes memory data) public view {
        (address signal, uint256 merkle_root, uint256 nullifierHash, uint256[8] memory proof) = abi.decode(data, (address, uint256, uint256, uint256[8]));
        verifyAndExecute(signal, merkle_root, nullifierHash, proof);
    }

    function verifyAndExecute (
    address signal,
    uint256 root,
    uint256 nullifierHash,
    uint256[8] memory proof
    ) view internal {
        // First, we make sure this person hasn't done this before
        // if (nullifierHashes[nullifierHash]) revert InvalidNullifier();

        // We now verify the provided proof is valid and the user is verified by World ID
        worldId.verifyProof(
            root,
            groupId, // set to "1" in the constructor
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // We now record the user has done this, so they can't do it again (sybil-resistance)
        // nullifierHashes[nullifierHash] = true;

        // Finally, execute your logic here, knowing the user is verified
    }
}
