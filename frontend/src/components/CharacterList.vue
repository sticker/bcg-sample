<template>
  <div>
    Your Characters: {{ ownedCharacters.length }}<br/>
    TransferAddress: <input type="text" v-model="transferAddress" />
    <ul class="character-list">
      <li v-for="(item) in ownedCharacters" :key="item.id">
        <div class="character-img">
          <p class="img"><img :src="item.image"></p>
        </div>
        <div class="transfer">
          <button @click="onTransferCharacter(item.id)">Transfer</button>
        </div>
        <span> {{ errorMessage }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  components: {
  },

  data() {
    return {
      errorMessage: '',
      transferAddress: '',
    };
  },

  computed: {
    ...mapState([
      'ownedCharacters',
    ]),


  },

  methods: {
    ...mapActions(['transferCharacter']),

    async onTransferCharacter(tokenId) {
      try {
        await this.transferCharacter({address: this.transferAddress, tokenId});
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
.character-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, 150px);
}

.character-img {
  display: inline-block;
  text-align: right;
}

.character-img img {
  width: 150px;
}
</style>