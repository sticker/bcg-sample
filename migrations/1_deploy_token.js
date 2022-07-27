const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const GameToken = artifacts.require("GameToken");

module.exports = async function (deployer, network, accounts) {
  const gameToken = await deployProxy(GameToken, [], { deployer });
};