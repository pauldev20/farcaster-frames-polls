// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IWorldID} from "../lib/world-id-onchain-template/contracts/src/interfaces/IWorldID.sol";
import {SignUpGatekeeper} from "../lib/maci/contracts/contracts/gatekeepers/SignUpGatekeeper.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {ByteHasher} from "../src/ByteHasher.sol";

/// @title SignUpWorldcoinGatekeeper
/// @notice This contract allows to gatekeep MACI signups
/// by requiring new voters to verify with worldcoin
contract SignUpWorldcoinGatekeeper is SignUpGatekeeper, Ownable {
    using ByteHasher for bytes;
    /// @notice the reference to the World ID Router contract
    address public worldId;
    /// @notice the reference to the MACI contract
    address public maci;
    /// @notice used for the worldID proof, contains app_id and action
    uint256 internal externalNullifierHash;

    /// @notice a mapping of nullifier hashes to whether they have been used to sign up
    mapping(uint256 => bool) public registerednullifierHashes;

    /// @notice custom errors
    error AlreadyRegistered();
    error OnlyMACI();

    /// @notice creates a new SignUpWorldcoinGatekeeper
    /// @param _worldId the address of the World ID Router contract
    /// @param _appId the name of the World ID app
    /// @param _action the name of the World ID action
    constructor(
        address owner,
        address _worldId,
        string memory _appId,
        string memory _action
    ) payable Ownable(owner) {
        worldId = _worldId;
        externalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _action)
            .hashToField();
    }

    /// @notice Adds an uninitialised MACI instance to allow for signups
    /// @param _maci The MACI contract interface to be stored
    function setMaciInstance(address _maci) public override onlyOwner {
        maci = _maci;
    }

    /// @notice Registers the user if they have a valid worldID proof
    /// Throws if the user does not have a valid proof or if the worldID has
    /// already been used to sign up.
    /// @param _user The user's Ethereum address.
    /// @param _data The ABI-encoded worldID proof.
    function register(address _user, bytes memory _data) public override {
        if (maci != msg.sender) revert OnlyMACI();
        // Decode the given _data bytes into the data for the worldID proof
        (
            address signal,
            uint256 merkle_root,
            uint256 nullifierHash,
            uint256[8] memory proof
        ) = abi.decode(_data, (address, uint256, uint256, uint256[8]));

        IWorldID(worldId).verifyProof(
            merkle_root,
            1, // set to "1" in the constructor
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // Check if the nullifier hash has already been used
        bool alreadyRegistered = registerednullifierHashes[nullifierHash];
        if (alreadyRegistered) revert AlreadyRegistered();

        // Mark the nullifier hash as already used
        registerednullifierHashes[nullifierHash] = true;
    }
}
