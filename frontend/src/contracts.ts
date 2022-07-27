import { abi as gameTokenAbi, networks as gameTokenNetworks } from '../../build/contracts/GameToken.json';
import { abi as charactersAbi, networks as charactersNetworks } from '../../build/contracts/Characters.json';
import { abi as boxesAbi, networks as boxesNetworks } from '../../build/contracts/Boxes.json';

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

const networkId = process.env.VUE_APP_NETWORK_ID || '5777';
type Networks = Partial<Record<string, { address: string }>>;
type Abi = any[];

export async function setUpGameToken(web3: Web3): Promise<Contract> {
  const gameTokenAddr = process.env.VUE_APP_GAME_TOKEN_CONTRACT_ADDRESS || (gameTokenNetworks as Networks)[networkId]!.address;;
  const GameToken = new web3.eth.Contract(gameTokenAbi as Abi, gameTokenAddr);
  return GameToken;
}

export async function setUpCharacters(web3: Web3): Promise<Contract> {
  const charactersAddr = process.env.VUE_APP_CHARACTERS_CONTRACT_ADDRESS || (charactersNetworks as Networks)[networkId]!.address;;
  const Characters = new web3.eth.Contract(charactersAbi as Abi, charactersAddr);
  return Characters;
}

export async function setUpBoxes(web3: Web3): Promise<Contract> {
  const boxesAddr = process.env.VUE_APP_BOXES_CONTRACT_ADDRESS || (boxesNetworks as Networks)[networkId]!.address;;
  const Boxes = new web3.eth.Contract(boxesAbi as Abi, boxesAddr);
  return Boxes;
}
