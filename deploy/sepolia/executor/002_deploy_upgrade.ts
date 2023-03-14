import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
const main: DeployFunction = async function(hre: any) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get, execute } = hre.deployments;

  const executorImpl = await deploy("ExecutorV2", {
    from: deployer,
    log: true,
    contract: "ExecutorV2",
  });

  // todo check impl address
  // const executorProxy = await get("Executor_Proxy");
  // let iface = new hre.ethers.utils.Interface([
  //   "function upgradeTo(address newImplementation)",
  // ]);
  // const calldata = iface.encodeFunctionData("upgradeTo", [
  //   executorImpl.address,
  // ]);
  // await execute(
  //   "Multisig",
  //   {
  //     from: deployer,
  //     log: true,
  //   },
  //   "submitTransaction",
  //   executorProxy.address,
  //   0,
  //   calldata
  // );
};

main.id = "ethereum_sepolia_executor_upgrade_deploy";
main.tags = ["ethereum", "sepolia", "Executor"];
main.dependencies = ["ethereum_sepolia_multisig_deploy"];

export default main;
