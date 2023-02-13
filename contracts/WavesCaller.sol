// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./AbstractCaller.sol";

contract WavesCaller is AbstractCaller {
    event WavesCallEvent(
        uint16 callerChainId,
        uint16 executionChainId,
        address caller,
        string executionContract,
        string functionName,
        string[] args,
        uint256 nonce
    );

    function init(address admin_, uint16 chainId_) external whenNotInitialized {
        require(admin_ != address(0), "zero address");
        admin = admin_;
        pauser = admin_;
        chainId = chainId_;
        isInited = true;
    }

    function call(
        uint16 executionChainId_,
        string calldata executionContract_,
        string calldata functionName_,
        string[] calldata args_
    ) external whenInitialized whenAllowed(msg.sender) whenNotPaused {
        nonce++;
        emit WavesCallEvent(
            chainId,
            executionChainId_,
            msg.sender,
            executionContract_,
            functionName_,
            args_,
            nonce
        );
    }
}
