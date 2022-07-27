<template>
  <div class="balance">
    <p>AVAX: {{ formattedAvaxBalance }}</p>
    <p>GameToken: {{ formattedGameTokenBalance }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Web3 from 'web3';

export default {
  components: {
  },

  data() {
    return {
    };
  },

  computed: {
    ...mapState([
      'avaxBalance',
      'gameTokenBalance',
    ]),

    formattedAvaxBalance() {
      return Web3.utils.fromWei(this.avaxBalance, 'ether');
    },
    formattedGameTokenBalance() {
      return Web3.utils.fromWei(this.gameTokenBalance, 'ether');
    },
  },

  methods: {
    
  },

  mounted() {
  },
};
</script>

<style scoped>
</style>