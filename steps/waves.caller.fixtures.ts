import { ethers } from "hardhat";

export const deployCaller = async () => {
  const [admin, other, third] = await ethers.getSigners();
  const RideCaller = await ethers.getContractFactory("WavesCaller");
  const caller = await RideCaller.deploy();

  return {
    caller,
    admin,
    other,
    third,
  };
};
