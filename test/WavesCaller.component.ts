import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployCaller } from "../steps/waves.caller.fixtures";
import {
  EXTERNAL_SOURCE_CHAIN_ID,
  TRANSPORT_SOURCE_CHAIN_ID,
  ZERO_ADDRESS,
} from "./data/constants";

describe("Waves Caller component", function() {
  describe("init tests", function() {
    it("should throw when try init with zero address", async () => {
      const { caller } = await loadFixture(deployCaller);
      await expect(
        caller.init(ZERO_ADDRESS, EXTERNAL_SOURCE_CHAIN_ID)
      ).to.be.rejectedWith("zero address");
      expect(await caller.admin()).to.be.equal(ZERO_ADDRESS);
      expect(await caller.pauser()).to.be.equal(ZERO_ADDRESS);
      expect(await caller.chainId()).to.be.equal(0);
    });

    /**
     * MEMO: Is it correct that everyone can invoke init?
     */
    it("simple positive", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.admin()).to.be.equal(admin.address);
      expect(await caller.pauser()).to.be.equal(admin.address);
      expect(await caller.chainId()).to.be.equal(EXTERNAL_SOURCE_CHAIN_ID);
    });

    it("should throw when try to re-init", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      await expect(
        caller.init(other.address, TRANSPORT_SOURCE_CHAIN_ID)
      ).to.be.revertedWith("already initialized");
      expect(await caller.admin()).to.be.equal(admin.address);
      expect(await caller.pauser()).to.be.equal(admin.address);
      expect(await caller.chainId()).to.be.equal(EXTERNAL_SOURCE_CHAIN_ID);
    });
  });

  describe("call tests", function() {
    it("should throw when not initialized", async () => {
      const { caller, admin } = await loadFixture(deployCaller);
      await expect(
        caller
          .connect(admin)
          .call(TRANSPORT_SOURCE_CHAIN_ID, caller.address, "funcName", [
            "arg1",
            "2",
          ])
      ).to.be.rejectedWith("not initialized");
    });

    it("should throw when not allowed", async () => {
      const { caller, admin, other, third } = await loadFixture(deployCaller);
      await caller.init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      await caller.connect(admin).allow(other.address);
      expect(await caller.allowance(other.address)).is.true;
      await expect(
        caller
          .connect(third)
          .call(TRANSPORT_SOURCE_CHAIN_ID, caller.address, "funcName", [
            "arg1",
            "2",
          ])
      ).to.be.rejectedWith("not allowed");
    });

    it("should throw when paused", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      await caller.connect(admin).allow(other.address);
      expect(await caller.allowance(other.address)).is.true;
      await caller.pause();
      await expect(
        caller
          .connect(other)
          .call(TRANSPORT_SOURCE_CHAIN_ID, caller.address, "funcName", [
            "arg1",
            "2",
          ])
      ).to.be.rejectedWith("paused");
    });

    it("simple positive", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      await caller.connect(admin).allow(other.address);
      expect(await caller.allowance(other.address)).is.true;
      await expect(
        await caller
          .connect(other)
          .call(TRANSPORT_SOURCE_CHAIN_ID, caller.address, "funcName", [
            "",
            "arg1",
            "2",
          ])
      )
        .to.be.emit(caller, "WavesCallEvent")
        .withArgs(
          EXTERNAL_SOURCE_CHAIN_ID,
          TRANSPORT_SOURCE_CHAIN_ID,
          caller.address,
          "funcName",
          [other.address.toLocaleLowerCase(), "arg1", "2"],
          0
        );
    });
  });
});
