import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { ICharacter, IBox } from '../interfaces';

// export interface IWeb3EventSubscription {
//   unsubscribe(): void;
// }

export interface IState {
  // eventSubscriptions: () => IWeb3EventSubscription[];
  web3: Web3 | null,
  accounts: string[];
  defaultAccount: string | null;
  currentNetworkId: number | null;
  GameToken: Contract | null;
  Characters: Contract | null;
  Boxes: Contract | null;
  avaxBalance: string;
  gameTokenBalance: string;
  charactersMintPrice: string;
  boxesMintPrice: string;
  ownedCharacters: ICharacter[],
  ownedBoxes: IBox[],
}
