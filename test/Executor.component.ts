import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { createSig } from "../steps/executor";
import { deployExecutor } from "../steps/executor.fixtures";
import {
  EXTERNAL_SOURCE_CHAIN_ID,
  TRANSPORT_SOURCE_CHAIN_ID,
  ZERO_ADDRESS,
} from "./data/constants";
// import { FakeContract, smock } from "@defi-wonderland/smock";
import { WavesCaller } from "../typechain-types";

xdescribe("Executor component", function() {
  describe("init tests", function() {
    /**
     * MEMO: Maybe for ident methods create one signature?
     */
    it("should throw when admin has zero address", async () => {
      const { executor, other } = await loadFixture(deployExecutor);
      await expect(
        executor.init(ZERO_ADDRESS, EXTERNAL_SOURCE_CHAIN_ID, other.address)
      ).to.be.rejectedWith("zero address");
      expect(await executor.admin()).to.be.equal(ZERO_ADDRESS);
      expect(await executor.pauser()).to.be.equal(ZERO_ADDRESS);
      expect(await executor.protocolSigner()).to.be.equal(ZERO_ADDRESS);
      expect(await executor.chainId()).to.be.equal(0);
    });

    /**
     * MEMO: error messages must be diffirent for diffirent cases
     */
    it("should throw when signer has zero address", async () => {
      const { executor, admin } = await loadFixture(deployExecutor);
      await expect(
        executor.init(admin.address, EXTERNAL_SOURCE_CHAIN_ID, ZERO_ADDRESS)
      ).to.be.rejectedWith("zero address");
      expect(await executor.admin()).to.be.equal(ZERO_ADDRESS);
      expect(await executor.pauser()).to.be.equal(ZERO_ADDRESS);
      expect(await executor.protocolSigner()).to.be.equal(ZERO_ADDRESS);
      expect(await executor.chainId()).to.be.equal(0);
    });

    it("simple positive", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await executor.init(
        admin.address,
        EXTERNAL_SOURCE_CHAIN_ID,
        other.address
      );
      expect(await executor.admin()).to.be.equal(admin.address);
      expect(await executor.pauser()).to.be.equal(admin.address);
      expect(await executor.protocolSigner()).to.be.equal(other.address);
      expect(await executor.chainId()).to.be.equal(EXTERNAL_SOURCE_CHAIN_ID);
    });

    it("should throw when try to re-init", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await executor.init(
        admin.address,
        EXTERNAL_SOURCE_CHAIN_ID,
        other.address
      );
      await expect(
        executor.init(other.address, TRANSPORT_SOURCE_CHAIN_ID, admin.address)
      ).to.be.rejectedWith("already initialized");
      expect(await executor.admin()).to.be.equal(admin.address);
      expect(await executor.pauser()).to.be.equal(admin.address);
      expect(await executor.protocolSigner()).to.be.equal(other.address);
      expect(await executor.chainId()).to.be.equal(EXTERNAL_SOURCE_CHAIN_ID);
    });
  });

  describe("updateSigner tests", function() {
    it("should throw when not initialized", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await expect(
        executor.connect(admin).updateSigner(other.address)
      ).to.be.rejectedWith("not initialized");
    });

    it("should throw when called by no-admin", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await executor.init(
        admin.address,
        EXTERNAL_SOURCE_CHAIN_ID,
        other.address
      );
      await expect(
        executor.connect(other).updateSigner(admin.address)
      ).to.be.rejectedWith("only admin");
    });

    it("should throw when new signer has zero address", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await executor.init(
        admin.address,
        EXTERNAL_SOURCE_CHAIN_ID,
        other.address
      );
      await expect(
        executor.connect(admin).updateSigner(ZERO_ADDRESS)
      ).to.be.rejectedWith("zero address");
    });

    it("simple positive", async () => {
      const { executor, admin, other, third } = await loadFixture(
        deployExecutor
      );
      await executor.init(
        admin.address,
        EXTERNAL_SOURCE_CHAIN_ID,
        other.address
      );
      await expect(await executor.connect(admin).updateSigner(third.address))
        .to.be.emit(executor, "SignerUpdated")
        .withArgs(admin.address, other.address, third.address);
      expect(await executor.protocolSigner()).to.be.equal(third.address);
    });

    it("can set the same signer address", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await executor.init(
        admin.address,
        EXTERNAL_SOURCE_CHAIN_ID,
        other.address
      );
      await expect(await executor.connect(admin).updateSigner(other.address))
        .to.be.emit(executor, "SignerUpdated")
        .withArgs(admin.address, other.address, other.address);
      expect(await executor.protocolSigner()).to.be.equal(other.address);
    });
  });

  /**
   * BUGS:    1) mutex not worked
   */
  /**
   * TODO:    1) check the race condition
   *          2) check callData size
   */
  describe("execute tests", function() {
    // let fakeCaller: FakeContract<WavesCaller>;

    // beforeEach(async () => {
    //   fakeCaller = await smock.fake("WavesCaller");
    // });

    it("should throw when paused", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await executor.init(
        admin.address,
        EXTERNAL_SOURCE_CHAIN_ID,
        other.address
      );
      await executor.connect(admin).pause();
      expect(await executor.isPaused()).is.true;
      await expect(
        executor
          .connect(admin)
          .execute(
            admin.address,
            ethers.utils.randomBytes(32),
            TRANSPORT_SOURCE_CHAIN_ID,
            EXTERNAL_SOURCE_CHAIN_ID,
            "executor",
            "tx hash",
            123,
            ethers.utils.randomBytes(32)
          )
      ).to.be.rejectedWith("paused");
    });

    it("should throw when not initialized", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await expect(
        executor
          .connect(admin)
          .execute(
            admin.address,
            ethers.utils.randomBytes(32),
            TRANSPORT_SOURCE_CHAIN_ID,
            EXTERNAL_SOURCE_CHAIN_ID,
            "executor",
            "tx hash",
            123,
            ethers.utils.randomBytes(32)
          )
      ).to.be.rejectedWith("not initialized");
    });

    it("should throw when execution chain the same", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await executor.init(
        admin.address,
        EXTERNAL_SOURCE_CHAIN_ID,
        other.address
      );
      await expect(
        executor
          .connect(admin)
          .execute(
            admin.address,
            ethers.utils.randomBytes(32),
            EXTERNAL_SOURCE_CHAIN_ID,
            EXTERNAL_SOURCE_CHAIN_ID,
            "executor",
            "tx hash",
            123,
            ethers.utils.randomBytes(32)
          )
      ).to.be.rejectedWith("uncompatible chain");
    });

    it("should throw when incorrect signature", async () => {
      const { executor, admin, other } = await loadFixture(deployExecutor);
      await executor.init(
        admin.address,
        TRANSPORT_SOURCE_CHAIN_ID,
        other.address
      );
      const executorName = "executor";
      const currentTxHash = ethers.utils.randomBytes(32).toString();
      const randomCallData = ethers.utils.randomBytes(64);
      const nonce = 321;
      const wrongSig = await createSig(
        ["uint16", "uint16", "string", "string", "uint256", "address", "bytes"],
        [
          1366,
          EXTERNAL_SOURCE_CHAIN_ID,
          executorName,
          currentTxHash,
          nonce,
          other.address,
          randomCallData,
        ],
        other
      );
      await expect(
        executor
          .connect(other)
          .execute(
            other.address,
            ethers.utils.randomBytes(32),
            TRANSPORT_SOURCE_CHAIN_ID,
            EXTERNAL_SOURCE_CHAIN_ID,
            executorName,
            currentTxHash,
            nonce,
            wrongSig
          )
      ).to.be.rejectedWith("only protocol signer");
    });

    it("simple positive", async () => {
      const { executor, caller, admin, other } = await loadFixture(
        deployExecutor
      );
      await executor.init(
        admin.address,
        TRANSPORT_SOURCE_CHAIN_ID,
        other.address
      );
      await caller.init(admin.address, TRANSPORT_SOURCE_CHAIN_ID);
      await caller.connect(admin).allow(executor.address);
      const executorName = "executor";
      const funcName = "mint";
      const funcData = ["one", "two", "fuck"];
      const currentTxHash = ethers.utils.randomBytes(32).toString();
      const callData = caller.interface.encodeFunctionData("call", [
        EXTERNAL_SOURCE_CHAIN_ID,
        executorName,
        funcName,
        funcData,
      ]);
      const nonce = 321;
      const sig = await createSig(
        ["uint16", "uint16", "string", "string", "uint256", "address", "bytes"],
        [
          TRANSPORT_SOURCE_CHAIN_ID,
          EXTERNAL_SOURCE_CHAIN_ID,
          executorName,
          currentTxHash,
          nonce,
          caller.address,
          callData,
        ],
        other
      );
      await expect(
        await executor.execute(
          caller.address,
          callData,
          TRANSPORT_SOURCE_CHAIN_ID,
          EXTERNAL_SOURCE_CHAIN_ID,
          executorName,
          currentTxHash,
          nonce,
          sig
        )
      )
        .to.be.emit(caller, "WavesCallEvent")
        .withArgs(
          TRANSPORT_SOURCE_CHAIN_ID,
          EXTERNAL_SOURCE_CHAIN_ID,
          executor.address,
          executorName,
          funcName,
          funcData,
          await caller.nonce()
        );
    });

    it("should throw when hash is duplicate", async () => {
      const { executor, caller, admin, other } = await loadFixture(
        deployExecutor
      );
      await executor.init(
        admin.address,
        TRANSPORT_SOURCE_CHAIN_ID,
        other.address
      );
      await caller.init(admin.address, TRANSPORT_SOURCE_CHAIN_ID);
      await caller.connect(admin).allow(executor.address);
      const executorName = "executor";
      const funcName = "mint";
      const funcData = ["one", "two", "fuck"];
      const currentTxHash = ethers.utils.randomBytes(32).toString();
      const callData = caller.interface.encodeFunctionData("call", [
        EXTERNAL_SOURCE_CHAIN_ID,
        executorName,
        funcName,
        funcData,
      ]);
      const nonce = 321;
      const sig = await createSig(
        ["uint16", "uint16", "string", "string", "uint256", "address", "bytes"],
        [
          TRANSPORT_SOURCE_CHAIN_ID,
          EXTERNAL_SOURCE_CHAIN_ID,
          executorName,
          currentTxHash,
          nonce,
          caller.address,
          callData,
        ],
        other
      );
      await expect(
        await executor.execute(
          caller.address,
          callData,
          TRANSPORT_SOURCE_CHAIN_ID,
          EXTERNAL_SOURCE_CHAIN_ID,
          executorName,
          currentTxHash,
          nonce,
          sig
        )
      ).to.be.emit(caller, "WavesCallEvent");
      await expect(
        executor.execute(
          caller.address,
          callData,
          TRANSPORT_SOURCE_CHAIN_ID,
          EXTERNAL_SOURCE_CHAIN_ID,
          executorName,
          currentTxHash,
          nonce,
          sig
        )
      ).to.be.rejectedWith("duplicate data");
    });

    // todo BUG!!! describec all for this test
    // it("should throw when mutex", async () => {
    //   const { executor, caller, admin, other } = await loadFixture(
    //     deployExecutor
    //   );
    //   await executor.init(
    //     admin.address,
    //     TRANSPORT_SOURCE_CHAIN_ID,
    //     other.address
    //   );
    //   const executorName = "executor";
    //   const currentTxHash = ethers.utils.randomBytes(32).toString();
    //   const nonce = 321;
    //   const callData = executor.interface.encodeFunctionData("execute", [
    //     other.address,
    //     ethers.utils.randomBytes(64),
    //     TRANSPORT_SOURCE_CHAIN_ID,
    //     EXTERNAL_SOURCE_CHAIN_ID,
    //     executorName,
    //     currentTxHash,
    //     nonce,
    //     ethers.utils.randomBytes(32),
    //   ]);
    //   const sig = await createSig(
    //     ["uint16", "uint16", "string", "string", "uint256", "address", "bytes"],
    //     [
    //       TRANSPORT_SOURCE_CHAIN_ID,
    //       EXTERNAL_SOURCE_CHAIN_ID,
    //       executorName,
    //       currentTxHash,
    //       nonce,
    //       caller.address,
    //       callData,
    //     ],
    //     other
    //   );
    //   await expect(
    //     await executor.execute(
    //       executor.address,
    //       callData,
    //       TRANSPORT_SOURCE_CHAIN_ID,
    //       EXTERNAL_SOURCE_CHAIN_ID,
    //       executorName,
    //       currentTxHash,
    //       nonce,
    //       sig
    //     )
    //   ).to.be.rejectedWith("mutex lock");
    // });

    /**
   * TODO: CHANGE STUB! This not works correct
     */
    // it("should revert when no error (no data)", async () => {
    //   fakeCaller.init.reverts();
    //   const { executor, admin, other } = await loadFixture(deployExecutor);
    //   await executor.init(
    //     admin.address,
    //     TRANSPORT_SOURCE_CHAIN_ID,
    //     other.address
    //   );
    //   const currentTxHash = ethers.utils.randomBytes(32).toString();
    //   const executorName = "executor";
    //   const nonce = 321;
    //   const callData = fakeCaller.interface.encodeFunctionData("init", [
    //     admin.address,
    //     TRANSPORT_SOURCE_CHAIN_ID,
    //   ]);
    //   const sig = await createSig(
    //     ["uint16", "uint16", "string", "string", "uint256", "address", "bytes"],
    //     [
    //       TRANSPORT_SOURCE_CHAIN_ID,
    //       EXTERNAL_SOURCE_CHAIN_ID,
    //       executorName,
    //       currentTxHash,
    //       nonce,
    //       fakeCaller.address,
    //       callData,
    //     ],
    //     other
    //   );
    //   await expect(
    //     executor.execute(
    //       fakeCaller.address,
    //       callData,
    //       TRANSPORT_SOURCE_CHAIN_ID,
    //       EXTERNAL_SOURCE_CHAIN_ID,
    //       executorName,
    //       currentTxHash,
    //       nonce,
    //       sig
    //     )
    //   ).to.be.rejectedWith("no error");
    // });

    it("[ADDITIONAL] check not-empty returned data", async () => {
      const { executor, caller, admin, other } = await loadFixture(
        deployExecutor
      );
      await executor.init(
        admin.address,
        TRANSPORT_SOURCE_CHAIN_ID,
        other.address
      );
      await caller.init(admin.address, TRANSPORT_SOURCE_CHAIN_ID);
      await caller.connect(admin).allow(executor.address);
      const executorName = "executor";
      const funcName = "mint";
      const funcData = ["one", "two", "fuck"];
      const currentTxHash = ethers.utils.randomBytes(32).toString();
      const callData = caller.interface.encodeFunctionData("call", [
        EXTERNAL_SOURCE_CHAIN_ID,
        executorName,
        funcName,
        funcData,
      ]);
      const nonce = 321;
      const sig = await createSig(
        ["uint16", "uint16", "string", "string", "uint256", "address", "bytes"],
        [
          TRANSPORT_SOURCE_CHAIN_ID,
          EXTERNAL_SOURCE_CHAIN_ID,
          executorName,
          currentTxHash,
          nonce,
          caller.address,
          callData,
        ],
        other
      );
      const data = await executor.execute(
        caller.address,
        callData,
        TRANSPORT_SOURCE_CHAIN_ID,
        EXTERNAL_SOURCE_CHAIN_ID,
        executorName,
        currentTxHash,
        nonce,
        sig
      );
      expect(data.to).to.be.equal(executor.address);
    });
  });
});
