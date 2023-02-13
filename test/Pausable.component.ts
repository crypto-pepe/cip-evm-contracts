import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployCaller } from "../steps/waves.caller.fixtures";
import { EXTERNAL_SOURCE_CHAIN_ID, ZERO_ADDRESS } from "./data/constants";

describe("Pausable additional component tests", function() {
  describe("paused tests", function() {
    it("should throw when call no-pauser", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.isPaused()).is.false;
      await expect(caller.connect(other).pause()).to.be.rejectedWith(
        "only pauser"
      );
      expect(await caller.isPaused()).is.false;
    });

    it("simple positive", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.isPaused()).is.false;
      await expect(await caller.connect(admin).pause())
        .to.be.emit(caller, "Paused")
        .withArgs(admin.address);
      expect(await caller.isPaused()).is.true;
    });

    it("should throw when paused", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      await caller.connect(admin).pause();
      expect(await caller.isPaused()).is.true;
      await expect(caller.connect(admin).pause()).to.be.rejectedWith("paused");
      expect(await caller.isPaused()).is.true;
    });
  });

  describe("unpaused tests", function() {
    it("should throw when not paused", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.isPaused()).is.false;
      await expect(caller.connect(admin).unpause()).to.be.rejectedWith(
        "not paused"
      );
      expect(await caller.isPaused()).is.false;
    });

    it("should throw when call no-pauser", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      await caller.connect(admin).pause();
      expect(await caller.isPaused()).is.true;
      await expect(caller.connect(other).unpause()).to.be.rejectedWith(
        "only pauser"
      );
      expect(await caller.isPaused()).is.true;
    });

    it("simple positive", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.isPaused()).is.false;
      await caller.connect(admin).pause();
      expect(await caller.isPaused()).is.true;
      await expect(await caller.connect(admin).unpause())
        .to.be.emit(caller, "Unpaused")
        .withArgs(admin.address);
      expect(await caller.isPaused()).is.false;
    });
  });

  describe("updatePauser tests", function() {
    it("should throw when called no-admin", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      await expect(
        caller.connect(other).updatePauser(other.address)
      ).to.be.rejectedWith("only admin");
    });

    it("should throw when pauser has zero address", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      await expect(
        caller.connect(admin).updatePauser(ZERO_ADDRESS)
      ).to.be.rejectedWith("zero address");
    });

    it("simple positive", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.pauser()).to.be.equal(admin.address);
      await expect(await caller.connect(admin).updatePauser(other.address))
        .to.be.emit(caller, "PauserUpdated")
        .withArgs(admin.address, admin.address, other.address);
      expect(await caller.pauser()).to.be.equal(other.address);
    });

    it("can change pauser to the same address", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.pauser()).to.be.equal(admin.address);
      await expect(await caller.connect(admin).updatePauser(admin.address))
        .to.be.emit(caller, "PauserUpdated")
        .withArgs(admin.address, admin.address, admin.address);
      expect(await caller.pauser()).to.be.equal(admin.address);
    });
  });
});
