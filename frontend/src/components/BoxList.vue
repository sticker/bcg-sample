<template>
  <div>
    Your Boxes: {{ ownedBoxes.length }}<br/>
    TransferAddress: <input type="text" v-model="transferAddress" />
    <ul class="box-list">
      <li v-for="(item) in ownedBoxes" :key="item.id">
        <div class="box-img">
          <p class="img"><img :src="item.image"></p>
        </div>
        <div class="transfer">
          <button @click="onTransferBox(item.id)">Transfer</button>
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
      'ownedBoxes',
    ]),


  },

  methods: {
    ...mapActions(['transferBox']),

    async onTransferBox(tokenId) {
      try {
        await this.transferBox({address: this.transferAddress, tokenId});
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
.box-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, 150px);
}

.box-img {
  display: inline-block;
  text-align: right;
}

.box-img img {
  width: 150px;
}
</style>