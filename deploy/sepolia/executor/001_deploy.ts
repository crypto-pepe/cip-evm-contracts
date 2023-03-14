import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
const main: DeployFunction = async function(hre: any) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const multisig = await get("Multisig_Proxy");
  const sepoliaChainId = 10002;
  const signer = "7b7e114b8da43ee935b01c415ade9884e0f41f22";

  await deploy("Executor", {
    from: deployer,
    log: true,
    contract: "Executor",
    proxy: {
      owner: multisig.address,
      execute: {
        init: {
          methodName: "init",
          args: [multisig.address, sepoliaChainId, signer],
        },
      },
    },
  });
};

main.id = "ethereum_sepolia_executor_deploy";
main.tags = ["ethereum", "sepolia", "Executor"];
main.dependencies = ["ethereum_sepolia_multisig_deploy"];

export default main;
