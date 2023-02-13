import { ethers } from 'hardhat';

export const createSig = async function (
    types: string[],
    datas: any[],
    signer: any
) {
    const data = ethers.utils.solidityKeccak256(types, datas);
    return await signer.signMessage(ethers.utils.arrayify(data));
};