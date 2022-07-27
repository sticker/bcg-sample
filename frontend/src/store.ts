import Vuex, { Dispatch } from 'vuex';
import Web3 from 'web3';
import _ from 'lodash';

import { setUpGameToken, setUpCharacters, setUpBoxes } from './contracts';
import { IState } from './interfaces';
import { characterFromContract, boxFromContract } from './contract-models';

import axios from 'axios';
import HDWalletProvider from '@truffle/hdwallet-provider';

const defaultCallOptions = (state: IState) => ({ from: state.defaultAccount });

// interface SetEventSubscriptionsPayload {
//   eventSubscriptions: () => IWeb3EventSubscription[];
// }

async function getConfirmations(web3: Web3, txHash: string) {
  try {
    // Get transaction details
    const trx = await web3.eth.getTransaction(txHash)
    console.log(trx);

    // Get current block number
    const currentBlock = await web3.eth.getBlockNumber()
    console.log(currentBlock)

    // When transaction is unconfirmed, its block number is null.
    // In this case we return 0 as number of confirmations
    return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber
  }
  catch (error) {
    console.log(error)
  }
}

function confirmEtherTransaction(web3: Web3, txHash: string, confirmations = 10, dispatch: Dispatch, functionName: string) {
  setTimeout(async () => {
    // Get current number of confirmations and compare it with sought-for value
    const trxConfirmations = await getConfirmations(web3, txHash)
    console.log(trxConfirmations);
    console.log('Transaction with hash ' + txHash + ' has ' + trxConfirmations + ' confirmation(s)')

    if (trxConfirmations && trxConfirmations >= confirmations) {
      // Handle confirmation event according to your business logic
      console.log('Transaction with hash ' + txHash + ' has been successfully confirmed')
      dispatch(functionName);
      return;
    }
    // Recursive call
    return confirmEtherTransaction(web3, txHash, confirmations, dispatch, functionName)
  }, 3 * 1000)
}

export function createStore() {
  const web3 = new Web3(Web3.givenProvider || process.env.VUE_APP_WEB3_FALLBACK_PROVIDER);

  return new Vuex.Store<IState>({
    state: {
      // eventSubscriptions: () => [],
      web3: null,
      accounts: [],
      defaultAccount: null,
      currentNetworkId: null,
      GameToken: null,
      Characters: null,
      Boxes: null,
      avaxBalance: '0',
      gameTokenBalance: '0',
      charactersMintPrice: '0',
      boxesMintPrice: '0',
      ownedCharacters: [],
      ownedBoxes: [],
    },

    getters: {
    },

    mutations: {
      setWeb3(state, payload) {
        state.web3 = payload;
      },

      setNetworkId(state, payload) {
        state.currentNetworkId = payload;
      },

      setAccounts(state: IState, payload) {
        state.accounts = payload.accounts;

        if (payload.accounts.length > 0) {
          state.defaultAccount = payload.accounts[0];
        }
        else {
          state.defaultAccount = null;
        }
      },

      // setEventSubscriptions(state: IState, payload: SetEventSubscriptionsPayload) {
      //   state.eventSubscriptions = payload.eventSubscriptions;
      // },

      setGameToken(state: IState, payload) {
        state.GameToken = payload;
      },

      setCharacters(state: IState, payload) {
        state.Characters = payload;
      },

      setBoxes(state: IState, payload) {
        state.Boxes = payload;
      },

      updateAvaxBalance(state: IState, avaxBalance) {
        state.avaxBalance = avaxBalance;
      },

      updateGameTokenBalance(state: IState, gameTokenBalance) {
        state.gameTokenBalance = gameTokenBalance;
      },

      updateCharactersMintPrice(state: IState, price) {
        state.charactersMintPrice = price;
      },

      updateBoxesMintPrice(state: IState, price) {
        state.boxesMintPrice = price;
      },

      updateOwnedCharacters(state: IState, ownedCharacters) {
        state.ownedCharacters = ownedCharacters;
      },

      updateOwnedBoxes(state: IState, ownedBoxes) {
        state.ownedBoxes = ownedBoxes;
      },

    },

    actions: {
      async setUpWeb3({ state, commit }, { mnemonic, privateKey }) {
        // const wsProvider = new Web3.providers.WebsocketProvider(process.env.VUE_APP_RPC_URL as string)
        // HDWalletProvider.prototype.on = wsProvider.on.bind(wsProvider)

        const provider = new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic
          },
          providerOrUrl: process.env.VUE_APP_RPC_URL,
          // providerOrUrl: wsProvider,
          privateKeys: [privateKey],
        });
        const web3 = new Web3(provider);
        console.log(web3);
        commit('setWeb3', web3);

        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        // const accounts = web3.eth.accounts;
        console.log(account);
        if (!_.isEqual(state.accounts, [account])) {
          commit('setAccounts', { accounts: [account.address] });
        }
      },

      async initialize({ state, dispatch }) {
        if(!state.web3) return;
        await dispatch('setUpContracts');
        // await dispatch('setUpContractEvents');
        await dispatch('pollNetwork');
        await dispatch('fetchCharacterMintPrice');
        await dispatch('fetchBoxMintPrice');
        await dispatch('fetchUserDetails');
      },

      async setUpContracts({ state, commit }) {
        if(!state.web3) return;
        const GameToken = await setUpGameToken(state.web3);
        commit('setGameToken', GameToken);
        const Characters = await setUpCharacters(state.web3);
        commit('setCharacters', Characters);
        const Boxes = await setUpBoxes(state.web3);
        commit('setBoxes', Boxes);
      },

      async pollNetwork({ state, commit }) {
        if(!state.web3) return;
        const networkId = await state.web3.eth.net.getId();
        console.log(networkId);

        if(state.currentNetworkId !== networkId) {
          commit('setNetworkId', networkId);
        }
      },

      async pollAccountsAndNetwork({ state, dispatch, commit }) {
        if(!state.web3) return;
        let refreshUserDetails = false;
        const networkId = await state.web3.eth.net.getId();

        if(state.currentNetworkId !== networkId) {
          commit('setNetworkId', networkId);
          refreshUserDetails = true;
        }

        const accounts = await state.web3.eth.requestAccounts();

        if (!_.isEqual(state.accounts, accounts)) {
          commit('setAccounts', { accounts });
          refreshUserDetails = true;
        }

        if(refreshUserDetails) {
          await Promise.all([
            dispatch('setUpContractEvents'),
            dispatch('fetchUserDetails')
          ]);
        }
      },

      // setUpContractEvents({ state, dispatch, commit }) {
      //   state.eventSubscriptions().forEach(sub => sub.unsubscribe());

      //   const emptySubsPayload: SetEventSubscriptionsPayload = { eventSubscriptions: () => [] };
      //   commit('setEventSubscriptions', emptySubsPayload);

      //   if(!state.defaultAccount) return;

      //   const subscriptions: IWeb3EventSubscription[] = [];

      //   subscriptions.push(
      //     state.Characters!.events.NewCharacter(
      //       { filter: { minter: state.defaultAccount } },
      //       async (err: Error, data: any) => {
      //         if (err) {
      //           console.error(err, data);
      //           return;
      //         }
      //         await dispatch('fetchUserDetails');
      //       })
      //   );

      //   subscriptions.push(
      //     state.Boxes!.events.NewBox(
      //       { filter: { minter: state.defaultAccount } },
      //       async (err: Error, data: any) => {
      //         if (err) {
      //           console.error(err, data);
      //           return;
      //         }
      //         await dispatch('fetchUserDetails');
      //       })
      //   );

      //   const payload: SetEventSubscriptionsPayload = { eventSubscriptions: () => subscriptions };
      //   commit('setEventSubscriptions', payload);
      // },

      async fetchUserDetails({ dispatch }) {
        const promises = [
          dispatch('fetchAvaxBalance'),
          dispatch('fetchGameTokenBalance'),
          dispatch('fetchCharacters'),
          dispatch('fetchBoxes'),
        ];
        await Promise.all([promises]);
      },

      async fetchAvaxBalance({ state, commit }) {
        console.log('fetchAvaxBalance!');
        if(!state.web3) return;
        const { defaultAccount } = state;
        if(!defaultAccount) return;

        const avaxBalance = await state.web3.eth.getBalance(defaultAccount);
        if(state.avaxBalance !== avaxBalance) {
          commit('updateAvaxBalance', avaxBalance);
        }
      },

      async fetchGameTokenBalance({ state, commit }) {
        console.log('fetchGameTokenBalance!');
        const { defaultAccount } = state;
        if(!defaultAccount) return;

        const gameTokenBalance = await state.GameToken!.methods
          .balanceOf(defaultAccount)
          .call(defaultCallOptions(state));
        if(state.gameTokenBalance !== gameTokenBalance) {
          commit('updateGameTokenBalance', gameTokenBalance);
        }
      },

      async transferGameToken({ state }, { address, value }) {
        console.log('transferGameToken!');
        const { defaultAccount } = state;
        if(!defaultAccount) return;

        await state.GameToken!.methods
          .transfer(address, value)
          .send(defaultCallOptions(state));
      },

      async fetchCharacterMintPrice({ state, commit }) {
        console.log('fetchCharacterMintPrice!');
        const price = await state.Characters!.methods
          .mintPrice()
          .call();
        console.log(price);
        if(state.charactersMintPrice !== price) {
          commit('updateCharactersMintPrice', price);
        }
      },

      async mintCharacters({ state, dispatch }, { player }) {
        console.log('mintCharacters!');
        if(!state.web3) return;
        if(!state.defaultAccount) return;

        const tokenURI = 'https://bafkreiaara5lb53nl7irmkelxvuqifgmjvtyt5tj6g5ucmrrambnvxvbcu.ipfs.nftstorage.link/';
        const tx = await state.Characters!.methods
          .mint(player, tokenURI)
          .send({from: state.defaultAccount, value: state.charactersMintPrice});
        console.log(tx);
        confirmEtherTransaction(state.web3, tx.transactionHash, 2, dispatch, 'fetchUserDetails');
        // await dispatch('fetchUserDetails');
      },

      async fetchCharacters({ state, commit }) {
        console.log('fetchCharacters!');
        const characters = await state.Characters!.methods
          .getMyCharacters()
          .call(defaultCallOptions(state));
        console.log(characters);

        const ownedCharacters = [];
        for(let i = 0; i < characters.length; i++) {
          const res = await axios.get(characters[i].tokenURI);
          console.log(res);
          const metadataJson = JSON.parse(JSON.stringify(res.data));
          ownedCharacters.push(characterFromContract(characters[i].id, metadataJson));
        }
        commit('updateOwnedCharacters', ownedCharacters);
      },

      async transferCharacter({ state, dispatch }, { address, tokenId }) {
        console.log('transferCharacter!');
        if(!state.web3) return;
        if(!state.defaultAccount) return;

        const tx = await state.Characters!.methods
          .transferFrom(state.defaultAccount, address, tokenId)
          .send(defaultCallOptions(state));
        confirmEtherTransaction(state.web3, tx.transactionHash, 2, dispatch, 'fetchUserDetails');
      },

      async fetchBoxMintPrice({ state, commit }) {
        console.log('fetchBoxMintPrice!');
        const price = await state.Boxes!.methods
          .mintPrice()
          .call();
        console.log(price);
        if(state.boxesMintPrice !== price) {
          commit('updateBoxesMintPrice', price);
        }
      },

      async mintBoxes({ state, dispatch }, { player }) {
        console.log('mintBoxes!');
        if(!state.web3) return;
        if(!state.defaultAccount) return;

        const tokenURI = 'https://bafkreicoh7rvnhrzmqy2u4wdexnrjb4qwrpu3ilnb2t7hdbp5wgfq56p5q.ipfs.nftstorage.link/';
        const tx = await state.Boxes!.methods
          .mint(player, tokenURI)
          .send({from: state.defaultAccount, value: state.boxesMintPrice});
        confirmEtherTransaction(state.web3, tx.transactionHash, 2, dispatch, 'fetchUserDetails');
      },

      async fetchBoxes({ state, commit }) {
        console.log('fetchBoxes!');
        const boxes = await state.Boxes!.methods
          .getMyBoxes()
          .call(defaultCallOptions(state));
        console.log(boxes);

        const ownedBoxes = [];
        for(let i = 0; i < boxes.length; i++) {
          const res = await axios.get(boxes[i].tokenURI);
          console.log(res);
          const metadataJson = JSON.parse(JSON.stringify(res.data));
          ownedBoxes.push(boxFromContract(boxes[i].id, metadataJson));
        }
        commit('updateOwnedBoxes', ownedBoxes);
      },

      async transferBox({ state, dispatch }, { address, tokenId }) {
        console.log('transferBox!');
        if(!state.web3) return;
        if(!state.defaultAccount) return;

        console.log(address);
        console.log(tokenId);
        const tx = await state.Boxes!.methods
          .transferFrom(state.defaultAccount, address, tokenId)
          .send(defaultCallOptions(state));
        confirmEtherTransaction(state.web3, tx.transactionHash, 2, dispatch, 'fetchUserDetails');
      },

    }
  });
}
