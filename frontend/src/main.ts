import Vue from 'vue';
import Vuex from 'vuex';
import { createStore } from './store';
import App from './App.vue';

let expectedNetworkId: number | null = null;
if(process.env.VUE_APP_EXPECTED_NETWORK_ID) {
  expectedNetworkId = parseInt(process.env.VUE_APP_EXPECTED_NETWORK_ID, 10);
}

Vue.config.productionTip = false;

Vue.use(Vuex);

const store = createStore();

new Vue({
  render: h => h(App),
  store,
  provide: {
    expectedNetworkId,
  }
}).$mount('#app');
