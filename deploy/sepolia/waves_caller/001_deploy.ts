import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
const main: any = async function(hre: any) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const sepoliaChainId = 10002;
  const multisig = await get("Multisig_Proxy");

  await deploy("WavesCaller", {
    from: deployer,
    log: true,
    proxy: {
      owner: multisig.address,
      execute: {
        init: {
          methodName: "init",
          args: [multisig.address, sepoliaChainId],
        },
      },
    },
  });
};

main.id = "ethereum_sepolia_waves_caller_deploy";
main.tags = ["ethereum", "sepolia", "WavesCaller"];
main.dependencies = ["ethereum_sepolia_multisig_deploy"];

export default main;
