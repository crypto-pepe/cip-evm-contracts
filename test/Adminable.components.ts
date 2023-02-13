import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployCaller } from "../steps/waves.caller.fixtures";
import { EXTERNAL_SOURCE_CHAIN_ID, ZERO_ADDRESS } from "./data/constants";

describe("Adminable additional component tests", function() {
  describe("updateAdmin tests", function() {
    it("should throw when call no-admin", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.admin()).to.be.equal(admin.address);
      await expect(
        caller.connect(other).updateAdmin(other.address)
      ).to.be.rejectedWith("only admin");
      expect(await caller.admin()).to.be.equal(admin.address);
    });

    it("should throw when try to set zero address for admin", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.admin()).to.be.equal(admin.address);
      await expect(
        caller.connect(admin).updateAdmin(ZERO_ADDRESS)
      ).to.be.rejectedWith("zero address");
      expect(await caller.admin()).to.be.equal(admin.address);
    });

    it("simple positive", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.admin()).to.be.equal(admin.address);
      await expect(await caller.connect(admin).updateAdmin(other.address))
        .to.be.emit(caller, "AdminUpdated")
        .withArgs(admin.address, admin.address, other.address);
      expect(await caller.admin()).to.be.equal(other.address);
    });

    it("can update admin's address the same", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.admin()).to.be.equal(admin.address);
      await expect(await caller.connect(admin).updateAdmin(admin.address))
        .to.be.emit(caller, "AdminUpdated")
        .withArgs(admin.address, admin.address, admin.address);
      expect(await caller.admin()).to.be.equal(admin.address);
    });
  });
});
