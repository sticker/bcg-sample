const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Characters = artifacts.require("Characters");

const mintPrice = web3.utils.toWei('0.01', 'ether');

module.exports = async function (deployer, network, accounts) {
  const characters = await deployProxy(Characters, [mintPrice], { deployer });
};