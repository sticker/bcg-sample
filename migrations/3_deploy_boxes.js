const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Boxes = artifacts.require("Boxes");

const mintPrice = web3.utils.toWei('0.02', 'ether');

module.exports = async function (deployer, network, accounts) {
  const boxes = await deployProxy(Boxes, [mintPrice], { deployer });
};