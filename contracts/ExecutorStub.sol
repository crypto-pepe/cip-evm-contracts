// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ExecutorStub {
    event SignatureBytes(bytes32 data);

    function execute(
        uint16 callerChainId_,
        uint16 executionChainId_,
        uint256 nonce_,
        string calldata txHash_,
        address contract_,
        bytes calldata callData_
    ) external {
        bytes32 data = keccak256(
            abi.encodePacked(
                callerChainId_,
                executionChainId_,
                nonce_,
                txHash_,
                contract_,
                callData_
            )
        );

        emit SignatureBytes(
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", data)
            )
        );
    }
}
