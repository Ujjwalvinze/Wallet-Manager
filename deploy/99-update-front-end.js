// const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat.config");
const fs = require("fs");
const { network } = require("hardhat");

const frontEndContractsFile = "../wallet_manager_nextjs/constants/addresses.json";
const frontEndAbiFile = "../wallet_manager_nextjs/constants/abi.json";

module.exports = async () => {
    if (process.env.UPDATE) {
        console.log("Writing to front end...");
        await updateContractAddresses();
        await updateAbi();
        console.log("Front end written!");
    }
};

async function updateAbi() {
    const manager = await ethers.getContract("Manager");
    fs.writeFileSync(frontEndAbiFile, manager.interface.format(ethers.utils.FormatTypes.json));
}

async function updateContractAddresses() {
    const manager = await ethers.getContract("Manager");
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"));
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(manager.address)) {
            contractAddresses[network.config.chainId.toString()].pop();
            contractAddresses[network.config.chainId.toString()].push(manager.address);
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [manager.address];
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}
module.exports.tags = ["all", "frontend"];
