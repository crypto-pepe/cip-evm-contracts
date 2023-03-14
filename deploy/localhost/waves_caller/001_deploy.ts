// import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { DeployFunction } from "hardhat-deploy/types";

// // const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
// const main: any = async function(hre: any) {
//   const { deployer } = await hre.getNamedAccounts();
//   const { deploy, get } = hre.deployments;

//   const multisig = await get("Multisig_Proxy");
//   const chainId = 10002;

//   await deploy("WavesCaller", {
//     from: deployer,
//     log: true,
//     proxy: {
//       owner: multisig.address,
//       execute: {
//         init: {
//           methodName: "init",
//           args: [multisig.address, chainId],
//         },
//       },
//     },
//   });
// };

// main.id = "waves_caller_deploy_ethereum_localhost";
// main.tags = ["WavesCaller", "localhost"];

// export default main;
