// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Initializable.sol";
import "./Pausable.sol";
import "./ECDSA.sol";
import "./Mutex.sol";

contract Executor is Initializable, Pausable, Mutex {
    uint16 public chainId;
    address public protocolSigner;
    mapping(bytes32 => uint) private _hashes;

    event SignerUpdated(address sender, address oldSigner, address signer);

    function init(
        address admin_,
        uint16 chainId_,
        address signer_
    ) external whenNotInitialized {
        require(admin_ != address(0), "zero address");
        require(signer_ != address(0), "zero address");
        admin = admin_;
        pauser = admin_;
        chainId = chainId_;
        protocolSigner = signer_;
        isInited = true;
    }

    function updateSigner(address signer_) external whenInitialized onlyAdmin {
        require(signer_ != address(0), "zero address");
        emit SignerUpdated(msg.sender, protocolSigner, signer_);
        protocolSigner = signer_;
    }

    function execute(
        address contract_,
        bytes calldata callData_,
        uint16 callerChainId_,
        uint16 executionChainId_,
        string calldata executor_,
        string calldata txHash_,
        uint256 nonce_,
        bytes calldata signature_
    ) external whenNotPaused whenInitialized mutex returns (bytes memory) {
        require(chainId != executionChainId_, "uncompatible chain");
        require(contract_ != address(0), "zero address");

        bytes32 data = keccak256(
            bytes.concat(
                abi.encodePacked(
                    callerChainId_,
                    executionChainId_,
                    executor_,
                    txHash_
                ),
                abi.encodePacked(nonce_, contract_, callData_)
            )
        );

        require(_hashes[data] == 0, "duplicate data");
        require(
            ECDSA.recover(
                keccak256(
                    abi.encodePacked("\x19Ethereum Signed Message:\n32", data)
                ),
                signature_
            ) == protocolSigner,
            "only protocol signer"
        );
        _hashes[data] = block.number;

        (bool success_, bytes memory data_) = contract_.call(
            bytes.concat(callData_, bytes(executor_))
        );
        if (success_) {
            return data_;
        } else {
            if (data_.length > 0) {
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(data_)
                    revert(add(32, data_), returndata_size)
                }
            } else {
                revert("no error");
            }
        }
    }
}
