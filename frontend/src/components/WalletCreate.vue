<template>
  <div class="wallet-create">
    <button @click="createWallet()">Create Wallet</button>
    <button @click="importWallet()">Import Wallet</button><input type="text" v-model="inputMnemonicPhrase" />
    <span> {{ errorMessage }}</span>
    <p>address: {{ address }}</p>
    <p>mnemonic: {{ mnemonic }}</p>
    <p>privateKey: {{ privateKey }}</p>
    <p>defaultAccount: {{ defaultAccount }}</p>
    <button @click="onFetchUserDetails()">Fetch User Details</button>
  </div>
</template>

<script>

import { mapState, mapActions } from 'vuex';
import { ethers } from 'ethers';

export default {
  components: {
  },

  data() {
    return {
      errorMessage: '',
      address: null,
      mnemonic: null,
      privateKey: null,
      inputMnemonicPhrase: '',
    };
  },

  computed: {
    ...mapState([
      'defaultAccount'
    ]),
  },

  methods: {
    ...mapActions([
      'setUpWeb3', 'initialize', 'fetchUserDetails'
    ]),

    async createWallet() {
      const wallet = ethers.Wallet.fromMnemonic(
        ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16))
      );
      this.address = wallet.address;
      this.mnemonic = wallet.mnemonic.phrase;
      this.privateKey = wallet.privateKey;


      try {
        await this.setUpWeb3({mnemonic: this.mnemonic, privateKey: this.privateKey});
        await this.initialize();

      } catch (e) {
        console.error(e);
        this.errorMessage = e.message;
      }
    },

    async importWallet() {
      try {
        const accountFromInputMnemonic = ethers.Wallet.fromMnemonic(this.inputMnemonicPhrase);
        this.address = accountFromInputMnemonic.address;
        this.mnemonic = accountFromInputMnemonic.mnemonic.phrase;
        this.privateKey = accountFromInputMnemonic.privateKey;

        await this.setUpWeb3({mnemonic: this.mnemonic, privateKey: this.privateKey});
        await this.initialize();

      } catch (e) {
        console.error(e);
        this.errorMessage = e.message;
      }
    },

    async onFetchUserDetails() {
      await this.fetchUserDetails();
    },
  },

  mounted() {
  },
};
</script>

<style scoped>
</style>