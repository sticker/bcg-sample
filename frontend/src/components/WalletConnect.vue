<template>
  <div>
    <button class="connect" @click="connectMetamask">Connect Wallet</button><span> {{ errorMessage }}</span>
    <p>Wallet Address: {{ defaultAccount }}</p>
  </div>
</template>

<script>

import { mapState, mapActions } from 'vuex';

export default {
  inject: ['web3', 'expectedNetworkId'],

  data: () => ({
    errorMessage: '',
  }),

  computed: {
    ...mapState([
      'defaultAccount',
      'currentNetworkId',
    ]),

  },

  methods: {
    ...mapActions([
      'pollAccountsAndNetwork',
    ]),

    async configureMetaMask() {
      const web3 = this.web3.currentProvider;
      if (this.expectedNetworkId === 43113 && this.currentNetworkId !== 43113) {
        try {
          const ret = await web3.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa869' }],
          });
        } catch (switchError) {
          try {
            await web3.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xa869',
                  chainName: 'Avalanche Fuji Testnet',
                  nativeCurrency: {
                    name: 'AVAX',
                    symbol: 'AVAX',
                    decimals: 18,
                  },
                  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                  blockExplorerUrls: ['https://testnet.snowtrace.io'],
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
            this.errorMessage = addError.message;
          }
        }
      } else if (this.expectedNetworkId === 43114 && this.currentNetworkId !== 43114) {
        {
          try {
            const ret = await web3.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xa86a' }],
            });
          } catch (switchError) {
            try {
              await web3.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xa86a',
                    chainName: 'Avalanche C-Chain',
                    nativeCurrency: {
                      name: 'AVAX',
                      symbol: 'AVAX',
                      decimals: 18,
                    },
                    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
                    blockExplorerUrls: ['https://snowtrace.io'],
                  },
                ],
              });
            } catch (addError) {
              console.error(addError);
              this.errorMessage = addError.message;
            }
          }
        }
      }
    },

    async connectMetamask() {
      const web3 = this.web3.currentProvider;
      this.configureMetaMask();
      this.errorMessage = 'Connecting to MetaMask...';
      web3
        .request({ method: 'eth_requestAccounts' })
        .then(async () => {
          this.errorMessage = 'Success: MetaMask connected.';
          this.doPollAccounts = true;
          const pollAccounts = async () => {
            if (!this.doPollAccounts) return;
            try {
              await this.pollAccountsAndNetwork();
            } catch (e) {
              console.error(e);
            }
            setTimeout(pollAccounts, 200);
          };
          pollAccounts();
        })
        .catch(() => {
          this.errorMessage = 'Error: MetaMask could not get permissions.';
        });
    },

  },

  async created() {
    await this.configureMetaMask();
  },
};
</script>

<style>
</style>

<style scoped>
</style>
