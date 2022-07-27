import Vuex from 'vuex';
import Web3 from 'web3';
import _ from 'lodash';

import { setUpGameToken, setUpCharacters, setUpBoxes } from './contracts';
import { IState, IWeb3EventSubscription } from './interfaces';
import { characterFromContract, boxFromContract } from './contract-models';

import axios from 'axios';

const defaultCallOptions = (state: IState) => ({ from: state.defaultAccount });

interface SetEventSubscriptionsPayload {
  eventSubscriptions: () => IWeb3EventSubscription[];
}

export function createStore(web3: Web3) {
  return new Vuex.Store<IState>({
    state: {
      eventSubscriptions: () => [],
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

      setEventSubscriptions(state: IState, payload: SetEventSubscriptionsPayload) {
        state.eventSubscriptions = payload.eventSubscriptions;
      },

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
      async initialize({ dispatch }) {
        await dispatch('setUpContracts');
        await dispatch('setUpContractEvents');
        await dispatch('pollNetwork');
        await dispatch('fetchCharacterMintPrice');
        await dispatch('fetchBoxMintPrice');
      },

      async setUpContracts({ commit }) {
        const GameToken = await setUpGameToken(web3);
        commit('setGameToken', GameToken);
        const Characters = await setUpCharacters(web3);
        commit('setCharacters', Characters);
        const Boxes = await setUpBoxes(web3);
        commit('setBoxes', Boxes);
      },

      async pollNetwork({ state, commit }) {
        const networkId = await web3.eth.net.getId();

        if(state.currentNetworkId !== networkId) {
          commit('setNetworkId', networkId);
        }
      },

      async pollAccountsAndNetwork({ state, dispatch, commit }) {
        let refreshUserDetails = false;
        const networkId = await web3.eth.net.getId();

        if(state.currentNetworkId !== networkId) {
          commit('setNetworkId', networkId);
          refreshUserDetails = true;
        }

        const accounts = await web3.eth.requestAccounts();

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

      setUpContractEvents({ state, dispatch, commit }) {
        state.eventSubscriptions().forEach(sub => sub.unsubscribe());

        const emptySubsPayload: SetEventSubscriptionsPayload = { eventSubscriptions: () => [] };
        commit('setEventSubscriptions', emptySubsPayload);

        if(!state.defaultAccount) return;

        const subscriptions: IWeb3EventSubscription[] = [];

        subscriptions.push(
          state.Characters!.events.NewCharacter(
            { filter: { minter: state.defaultAccount } },
            async (err: Error, data: any) => {
              if (err) {
                console.error(err, data);
                return;
              }
              await dispatch('fetchUserDetails');
            })
        );

        subscriptions.push(
          state.Boxes!.events.NewBox(
            { filter: { minter: state.defaultAccount } },
            async (err: Error, data: any) => {
              if (err) {
                console.error(err, data);
                return;
              }
              await dispatch('fetchUserDetails');
            })
        );

        const payload: SetEventSubscriptionsPayload = { eventSubscriptions: () => subscriptions };
        commit('setEventSubscriptions', payload);
      },

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
        const { defaultAccount } = state;
        if(!defaultAccount) return;

        const avaxBalance = await web3.eth.getBalance(defaultAccount);
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

      async mintCharacters({ state }, { player }) {
        console.log('mintCharacters!');
        const { defaultAccount } = state;
        if(!defaultAccount) return;

        const tokenURI = 'https://bafkreiaara5lb53nl7irmkelxvuqifgmjvtyt5tj6g5ucmrrambnvxvbcu.ipfs.nftstorage.link/';
        await state.Characters!.methods
          .mint(player, tokenURI)
          .send({from: state.defaultAccount, value: state.charactersMintPrice});
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

      async transferCharacter({ state }, { address, tokenId }) {
        console.log('transferCharacter!');
        const { defaultAccount } = state;
        if(!defaultAccount) return;

        console.log(address);
        console.log(tokenId);
        await state.Characters!.methods
          .transferFrom(state.defaultAccount, address, tokenId)
          .send(defaultCallOptions(state));
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

      async mintBoxes({ state }, { player }) {
        console.log('mintBoxes!');
        const { defaultAccount } = state;
        if(!defaultAccount) return;

        const tokenURI = 'https://bafkreicoh7rvnhrzmqy2u4wdexnrjb4qwrpu3ilnb2t7hdbp5wgfq56p5q.ipfs.nftstorage.link/';
        await state.Boxes!.methods
          .mint(player, tokenURI)
          .send({from: state.defaultAccount, value: state.boxesMintPrice});
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

      async transferBox({ state }, { address, tokenId }) {
        console.log('transferBox!');
        const { defaultAccount } = state;
        if(!defaultAccount) return;

        console.log(address);
        console.log(tokenId);
        await state.Boxes!.methods
          .transferFrom(state.defaultAccount, address, tokenId)
          .send(defaultCallOptions(state));
      },

    }
  });
}
