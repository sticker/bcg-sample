<template>
  <div class="mint">
    <button @click="onMintCharacters()">Mint Characters</button><span> (needs {{ formattedCharactersMintPrice }} AVAX)</span>
    <button @click="onMintBoxes()">Mint Boxes</button><span> (needs {{ formattedBoxesMintPrice }} AVAX)</span>
    <p>{{ errorMessage }}</p>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Web3 from 'web3';

export default {
  components: {
  },

  data() {
    return {
      errorMessage: '',
    };
  },

  computed: {
    ...mapState([
      'defaultAccount',
      'charactersMintPrice',
      'boxesMintPrice',
    ]),

    formattedCharactersMintPrice() {
      return Web3.utils.fromWei(this.charactersMintPrice, 'ether');
    },

    formattedBoxesMintPrice() {
      return Web3.utils.fromWei(this.boxesMintPrice, 'ether');
    },

  },

  methods: {
    ...mapActions([
      'mintCharacters',
      'mintBoxes',
    ]),

    async onMintCharacters() {
      try {
        await this.mintCharacters({player: this.defaultAccount});
      } catch (e) {
        this.errorMessage = e;
        console.error(e);
      }
    },

    async onMintBoxes() {
      try {
        await this.mintBoxes({player: this.defaultAccount});
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