import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployCaller } from "../steps/waves.caller.fixtures";
import { EXTERNAL_SOURCE_CHAIN_ID } from "./data/constants";

describe("Allowed list addition component tests", function() {
  describe("allow test", function() {
    it("simple positive", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.allowance(admin.address)).is.false;
      expect(await caller.allowance(other.address)).is.false;
      await caller.connect(admin).allow(other.address);
      expect(await caller.allowance(admin.address)).is.false;
      expect(await caller.allowance(other.address)).is.true;
    });
  });

  describe("disallow test", function() {
    it("simple positive", async () => {
      const { caller, admin, other } = await loadFixture(deployCaller);
      await caller.connect(other).init(admin.address, EXTERNAL_SOURCE_CHAIN_ID);
      expect(await caller.allowance(other.address)).is.false;
      await caller.connect(admin).allow(other.address);
      expect(await caller.allowance(other.address)).is.true;
      await caller.connect(admin).disallow(other.address);
      expect(await caller.allowance(other.address)).is.false;
    });
  });
});
