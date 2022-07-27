<template>
  <div class="wallet-create">
    <button @click="createWallet()">Create Wallet</button>
    <p>address: {{ address }}</p>
    <p>mnemonic: {{ mnemonic }}</p>
    <p>privateKey: {{ privateKey }}</p>
  </div>
</template>

<script>

import { ethers } from 'ethers';
// import web3 from 'web3';

export default {
  inject: ['web3'],
  components: {
  },

  data() {
    return {
      address: null,
      mnemonic: null,
      privateKey: null,
    };
  },

  computed: {
  },

  methods: {
    createWallet() {
      const wallet = ethers.Wallet.fromMnemonic(
        ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16))
      );
      this.address = wallet.address;
      this.mnemonic = wallet.mnemonic.phrase;
      this.privateKey = wallet.privateKey;

      console.log(web3.eth.accounts.wallet);
    },
  },

  mounted() {
  },
};
</script>

<style scoped>
</style>