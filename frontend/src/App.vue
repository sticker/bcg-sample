<template>
  <div>
    <!-- <wallet-connect></wallet-connect> -->
    <wallet-create></wallet-create>
    <hr />
    <balance></balance>
    <transfer></transfer>
    <hr />
    <mint></mint>
    <character-list></character-list>
    <hr />
    <box-list></box-list>
  </div>
</template>

<script>

import { mapState, mapActions } from 'vuex';

// import WalletConnect from './components/WalletConnect.vue';
import WalletCreate from './components/WalletCreate.vue';
import Balance from './components/Balance.vue';
import Transfer from './components/Transfer.vue';
import Mint from './components/Mint.vue';
import CharacterList from './components/CharacterList.vue';
import BoxList from './components/BoxList.vue';

export default {
  components: {
    // WalletConnect,
    WalletCreate,
    Balance,
    Transfer,
    Mint,
    CharacterList,
    BoxList,
  },

  data: () => ({
    errorMessage: '',
  }),

  computed: {
    ...mapState([
      'defaultAccount',
    ]),

  },

  methods: {
    ...mapActions([
      'initialize',
    ]),
  },

  // async created() {
  //   try {
  //     await this.initialize();
  //   } catch (e) {
  //     console.error(e);
  //     this.errorMessage = e.message;
  //   }
  // },
};
</script>

<style>
</style>

<style scoped>
</style>
