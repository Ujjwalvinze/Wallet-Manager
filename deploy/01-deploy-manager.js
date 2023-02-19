const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat.config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const manager = await deploy("Manager", {
        from: deployer,
        args: [],
        log: true,
    });

    const args = [];
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(manager.address, args);
    }

    log("-------------------------------------------------");
};

module.exports.tags = ["all", "manager"];
