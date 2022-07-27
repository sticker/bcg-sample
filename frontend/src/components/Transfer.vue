<template>
  <div class="transfer">
    To: <input type="text" v-model="transferAddress" /><br>
    amount: <input type="text" v-model="amount" /><br>
    <button @click="onTransferToken()">Transfer GameToken</button><span> {{ errorMessage }}</span>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Web3 from 'web3';

export default {
  components: {
  },

  data() {
    return {
      transferAddress: '',
      amount: '0',
      errorMessage: '',
    };
  },

  computed: {
   
  },

  methods: {
    ...mapActions(['transferGameToken']),

    async onTransferToken() {
      try {
        await this.transferGameToken({address: this.transferAddress, value: Web3.utils.toWei(this.amount)});
      } catch (e) {
        this.errorMessage = e;
        console.error(e);
      }
    }
  },

  mounted() {
  },
};
</script>

<style scoped>
</style>