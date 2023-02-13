import { ethers } from "hardhat";

export const deployExecutor = async () => {
  const [admin, other, third] = await ethers.getSigners();
  const Executor = await ethers.getContractFactory("Executor");
  const executor = await Executor.deploy();
  await executor.deployed();

  const Caller = await ethers.getContractFactory("WavesCaller");
  const caller = await Caller.deploy();
  await caller.deployed();

  return {
    executor,
    caller,
    admin,
    other,
    third,
  };
};
