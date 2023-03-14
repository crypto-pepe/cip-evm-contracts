import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { execute } = hre.deployments;
  await execute(
      "WavesCaller",
      {
          from: deployer,
          log: true,
      },
      "allow",
      deployer
  );

  const wavesTestnetChainId = 10001;
  const wavesContractAddress = "test";
  const functionArgs: string[] = [];
  let functionName = "test";

  await execute(
    "WavesCaller",
    {
      from: deployer,
      log: true,
    },
    "call",
    wavesTestnetChainId,
    wavesContractAddress,
    functionName,
    functionArgs
  );

  functionName += "_int";
  functionArgs.push("1");

  await execute(
    "WavesCaller",
    {
      from: deployer,
      log: true,
    },
    "call",
    wavesTestnetChainId,
    wavesContractAddress,
    functionName,
    functionArgs
  );

  functionName += "_string";
  functionArgs.push("some");

  await execute(
    "WavesCaller",
    {
      from: deployer,
      log: true,
    },
    "call",
    wavesTestnetChainId,
    wavesContractAddress,
    functionName,
    functionArgs
  );
};

main.id = "waves_caller_call_localhost";
main.tags = ["WavesCaller", "localhost", "ethereum"];
module.exports.dependencies = ["WavesCaller"];

export default main;
