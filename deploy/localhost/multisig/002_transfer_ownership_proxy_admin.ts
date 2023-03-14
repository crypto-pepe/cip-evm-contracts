// import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { DeployFunction } from "hardhat-deploy/types";

// // const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
// const main: any = async function(hre: any) {
//   const { deployer } = await hre.getNamedAccounts();
//   const { execute, get } = hre.deployments;

//   const multisig = await get("Multisig_Proxy");

//   await execute(
//     "Multisig_Proxy",
//     {
//       from: deployer,
//       log: true,
//     },
//     "transferOwnership",
//     multisig.address
//   );
// };

// main.id = "multisig_transfer_ownership_proxy_admin_localhost";
// main.tags = ["Multisig", "localhost", "ethereum"];

// export default main;
