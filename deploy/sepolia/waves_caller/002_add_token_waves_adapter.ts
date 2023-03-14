import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
const main: DeployFunction = async function(hre: any) {
  const { deployer } = await hre.getNamedAccounts();
  const { get, execute, read } = hre.deployments;

  const wavesMintAdapter = "0x9F21bdD5198A6c8779bf034810AB00C9D058069E";

  if ((await read("WavesCaller", "allowance", wavesMintAdapter)) != true) {
    const wavesCaller = await get("WavesCaller_Proxy");
    let iface = new hre.ethers.utils.Interface([
      "function allow(address caller_)",
    ]);
    const calldata = iface.encodeFunctionData("allow", [wavesMintAdapter]);
    await execute(
      "Multisig",
      {
        from: deployer,
        log: true,
      },
      "submitTransaction",
      wavesCaller.address,
      0,
      calldata
    );
  }
};

main.id = "ethereum_sepolia_allow_waves_mint_adapter";
main.tags = ["ethereum", "sepolia", "WavesCaller"];
main.dependencies = ["ethereum_sepolia_waves_caller_deploy"];

export default main;
